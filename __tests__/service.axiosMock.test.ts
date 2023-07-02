import axios from 'axios';
import {
    axiosGetCurrentConfigResponse,
    axiosGetProductActionsResponse,
    bodyCurrentConfigsResponse,
} from './test-data/api-response';
import { RequestService } from '../src/service/request-service';

jest.mock('axios');

const mockedAxios = axios as jest.MockedFunction<typeof axios>;

describe('Configurations service', () => {
    const requestService = new RequestService();
    beforeEach(() => {
        mockedAxios.mockReset();
        jest.resetAllMocks();
    });

    it('should return current configs for the product if they were done', async () => {
        mockedAxios
            .mockResolvedValueOnce(axiosGetProductActionsResponse)
            .mockResolvedValue(axiosGetCurrentConfigResponse);
        const result = await requestService.getCurrentConfigs({
            orgId: 1,
            productId: 1,
        });

        expect(mockedAxios).toHaveBeenCalledTimes(2);
        expect(result).toEqual(bodyCurrentConfigsResponse);
    });

    it('should throw error if no user configuration choices were done', async () => {
        let { data } = axiosGetCurrentConfigResponse;
        data = { ...data, created_config: false };
        let currentConfigResp = {
            ...axiosGetCurrentConfigResponse,
            data: data,
        };

        mockedAxios
            .mockResolvedValueOnce(axiosGetProductActionsResponse)
            .mockResolvedValue(currentConfigResp);

        requestService
            .getCurrentConfigs({ orgId: 1, productId: 1 })
            .catch((e: PromiseRejectedResult) => {
                expect(mockedAxios).toHaveBeenCalled();
                expect(e)
                    .toEqual(`Error: The user didn't created a release configuration. 
    Please go to your MeasureSoftgram account and create one for this product.`);
            });
    });
});
