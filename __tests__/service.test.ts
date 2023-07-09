import { MSGBaseInfo, MSGCalc, RequestService } from '../src/service/request-service';
import Service from '../src/service/service';
import { bodyCalculateCharacteristicsResponse, bodyCalculateMeasuresResponse, bodyCalculateTSQMIResponse, bodyCalculateSubcharacteristicsResponse, bodyListOrganizationsResponse, bodyListProductsResponse, bodyListReleaseResponse, bodyListRepositoriesResponse, bodySonarCloudResponseMetrics, bodyCurrentConfigsResponse } from './test-data/api-response';

describe('Create message Tests', () => {
    const owner = 'fga-eps-mds';
    const repositoryName = '2023-1-MeasureSoftGram-Action';
    let requestService: RequestService;
    let service: Service;
    const currentDate = new Date('2023-06-19T00:00:00-04:00');
    const orgId = 1;
    const productId = 1;
    const repositoryId = 1;
    const productName = 'MeasureSoftGram'
    const metrics = bodySonarCloudResponseMetrics;

    beforeEach(() => {
        requestService = new RequestService();
        service = new Service(repositoryName, owner, productName, metrics, currentDate);
        jest.resetAllMocks();
    });

    test('should find the correct entity', async () => {
        const listOrganizations = bodyListOrganizationsResponse.results;

        const result: number = await service.checkEntityExists(listOrganizations, owner);

        expect(result).toBe(1);
    });

    test('should throw an error if the entity does not exist', async () => {
        const listOrganizations = bodyListOrganizationsResponse.results;

        await expect(service.checkEntityExists(listOrganizations, 'no-existent-organization')).rejects.toThrowError("Entity no-existent-organization does not exist.");
    });

    test('should not throw an error if there is an ongoing release', async () => {
        const listReleases = bodyListReleaseResponse;


        await expect(service.checkReleaseExists(listReleases)).resolves.not.toThrowError();
    });

    test('should throw an error if there is no ongoing release', async () => {
        const nextMonth = new Date('2023-07-19T00:00:00-04:00');

        const service = new Service(repositoryName, owner, 'productName', metrics, nextMonth);
        const listReleases = bodyListReleaseResponse;

        await expect(service.checkReleaseExists(listReleases)).rejects.toThrowError("No release is happening on 2023-07-19.");
    });

    it('should return the correct result when running the function to create metrics ', async () => {
        MSGCalc.calculate = jest.fn()
              .mockResolvedValueOnce(Promise.resolve())
        			.mockResolvedValueOnce(bodyCalculateMeasuresResponse)
        			.mockResolvedValueOnce(bodyCalculateCharacteristicsResponse)
        			.mockResolvedValueOnce(bodyCalculateSubcharacteristicsResponse)
        			.mockResolvedValueOnce(bodyCalculateTSQMIResponse);

        requestService.getCurrentConfigs = jest.fn().mockResolvedValue(bodyCurrentConfigsResponse);
        requestService.insertMetrics = jest.fn();
        requestService.calculateMeasures = jest.fn().mockResolvedValue(bodyCalculateMeasuresResponse);
        requestService.calculateCharacteristics = jest.fn().mockResolvedValue(bodyCalculateCharacteristicsResponse);
        requestService.calculateSubCharacteristics = jest.fn().mockResolvedValue(bodyCalculateSubcharacteristicsResponse);
        requestService.calculateTSQMI = jest.fn().mockResolvedValue(bodyCalculateTSQMIResponse);

        const result = await service.createMetrics(requestService, metrics, orgId, productId, repositoryId);
        console.debug('Result was: ', result)

        expect(MSGCalc.calculate).toHaveBeenCalledWith(
            {orgId, productId, repoId: repositoryId} as MSGBaseInfo,
            requestService.insertMetrics,
            JSON.stringify(metrics),
        );

        expect(MSGCalc.calculate).toHaveBeenCalledWith(
            { orgId, productId, repoId: repositoryId },
            requestService.calculateMeasures
        );

        expect(MSGCalc.calculate).toHaveBeenCalledWith(
            { orgId, productId, repoId: repositoryId },
            requestService.calculateCharacteristics
        );
        expect(MSGCalc.calculate).toHaveBeenCalledWith(
            { orgId, productId, repoId: repositoryId },
            requestService.calculateSubCharacteristics
        );

        expect(MSGCalc.calculate).toHaveBeenCalledWith(
            { orgId, productId, repoId: repositoryId },
            requestService.calculateTSQMI
        );

        expect(result).toEqual({
            ...result,
            data_characteristics: bodyCalculateCharacteristicsResponse,
            data_tsqmi: bodyCalculateTSQMIResponse
        });

    });

    it('should return the correct result when running the function to calculate result', async () => {
        MSGCalc.calculate = jest.fn()
        			.mockResolvedValueOnce(Promise.resolve())
        			.mockResolvedValueOnce(bodyCalculateMeasuresResponse)
        			.mockResolvedValueOnce(bodyCalculateCharacteristicsResponse)
        			.mockResolvedValueOnce(bodyCalculateSubcharacteristicsResponse)
        			.mockResolvedValueOnce(bodyCalculateTSQMIResponse)
        			.mockResolvedValueOnce(bodyListOrganizationsResponse)
        			.mockResolvedValueOnce(bodyListProductsResponse)
        			.mockResolvedValueOnce(bodyListRepositoriesResponse)
        			.mockResolvedValueOnce(bodyListReleaseResponse)

        requestService.getCurrentConfigs = jest.fn().mockResolvedValue(bodyCurrentConfigsResponse);
        requestService.insertMetrics = jest.fn();
        requestService.calculateMeasures = jest.fn().mockResolvedValue(bodyCalculateMeasuresResponse);
        requestService.calculateCharacteristics = jest.fn().mockResolvedValue(bodyCalculateCharacteristicsResponse);
        requestService.calculateSubCharacteristics = jest.fn().mockResolvedValue(bodyCalculateSubcharacteristicsResponse);
        requestService.calculateTSQMI = jest.fn().mockResolvedValue(bodyCalculateTSQMIResponse);
        requestService.listOrganizations = jest.fn().mockResolvedValue(bodyListOrganizationsResponse);
        requestService.listProducts = jest.fn().mockResolvedValue(bodyListProductsResponse);
        requestService.listRepositories = jest.fn().mockResolvedValue(bodyListRepositoriesResponse);
        requestService.listReleases = jest.fn().mockResolvedValue(bodyListReleaseResponse);

        const result = await service.calculateResults(requestService);

        expect(requestService.listOrganizations).toHaveBeenCalled();
        expect(requestService.listProducts).toHaveBeenCalled();
        expect(requestService.listRepositories).toHaveBeenCalled();
        expect(requestService.listReleases).toHaveBeenCalled();

        expect(result).toEqual([
            {
                "characteristics": [
                    {
                        "key": "reliability",
                        "value": 0.9254618113429579
                    }
                ],
                "measures": [],
                "repository": [],
                "tsqmi": [
                    { 
                        "key": "tsqmi", 
                        "value": 0.8359399436161667 
                    }], 
                    "subcharacteristics": [], 
                    "version": []
            }]);
    });
});
