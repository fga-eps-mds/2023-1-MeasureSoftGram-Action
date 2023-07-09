import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { MSGBaseUris } from '../utils';
import { MSGConfig } from '../indicators_i';

const INSUFFICIENT_ERROR =
    'Insufficient arguments provided to find object of calculation.';

export interface Organization {
    id: number;
    url: string;
    name: string;
    key: string;
    description: string;
    products: Array<string>;
    actions: unknown;
}

export interface Product {
    id: number;
    url: string;
    name: string;
    key: string;
    organization: string;
    description: string;
    repositories: Array<string>;
    actions: { [key: string]: string | number };
}

export interface Repository {
    id: number;
    url: string;
    name: string;
    key: string;
    description: string;
    product: string;
    latest_values: unknown;
    historical_values: unknown;
    actions: unknown;
}

export interface ResponseListRepositories {
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<Repository>;
}

export interface ResponseListProducts {
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<Product>;
}

export interface ResponseListReleases {
    id: number;
    release_name: string;
    start_at: string;
    created_by: number;
    end_at: string;
}

export interface ResponseListOrganizations {
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<Organization>;
}

export interface ResponseCalculateCharacteristics {
    id: number;
    key: string;
    name: string;
    description: string;
    latest: {
        id: number;
        value: number;
        created_at: string;
        characteristic_id: number;
    };
}

export interface ResponseCalculateSubcharacteristics {
    id: number;
    key: string;
    name: string;
    description: string;
    latest: {
        id: number;
        value: number;
        created_at: string;
        subcharacteristic_id: number;
    };
}

export interface ResponseCalculateMeasures {
    id: number;
    key: string;
    name: string;
    description: string;
    latest: {
        id: number;
        value: number;
        created_at: string;
        measure_id: number;
    };
}

export interface ResponseCalculateTSQMI {
    id: number;
    value: number;
    created_at: string;
}

export interface MSGBaseInfo {
    orgId?: number;
    productId?: number;
    repoId?: number;
    releaseId?: number;
}

export class RequestService {
    private MSGRAM_SERVICE_HOST = 'https://measuresoft.herokuapp.com';
    private MSG_TOKEN = "'secret';";
    private baseUrl = `${this.MSGRAM_SERVICE_HOST}/api/v1/`;

    public getBaseUrl(): string {
        return this.baseUrl;
    }

    public getMsgToken(): string {
        return this.MSG_TOKEN;
    }

    public setMsgToken(token: string): void {
        this.MSG_TOKEN = token;
    }

    private async makeRequest(
        method: 'get' | 'post',
        url: string,
        data: object = {}
    ): Promise<AxiosResponse | null> {
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.MSG_TOKEN,
            },
            method,
            url,
            data,
        };

        axios.defaults.timeout = 50000; // await for heroku to wake up

        let response: AxiosResponse | null = null;

        try {
            response = await axios(config);
            console.log(
                `Data ${method === 'get' ? 'received' : 'sent'}. Status code: ${
                    response?.status
                }`
            );
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                console.error(
                    `Failed to ${method} data to the API. ${axiosError.message}`
                );
                console.error(axiosError);
            } else {
                console.error('An unexpected error occurred.');
            }
        }

        if (response?.data) {
            console.log(`Data received. Status code: ${response.status}`);
            return response;
        } else {
            throw new Error('No data received from the API.');
        }
    }

    public async listOrganizations(): Promise<ResponseListOrganizations> {
        const url = `${this.baseUrl}organizations/`;
        const response = await this.makeRequest('get', url);
        return response?.data;
    }

    public async listProducts(orgId: number): Promise<ResponseListProducts> {
        const url = `${this.baseUrl}organizations/${orgId}/products/`;
        const response = await this.makeRequest('get', url);
        return response?.data;
    }

    public async listRepositories(
        orgId: number,
        productId: number
    ): Promise<ResponseListRepositories> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/`;
        const response = await this.makeRequest('get', url);
        return response?.data;
    }

    public async listReleases(
        orgId: number,
        productId: number
    ): Promise<ResponseListReleases[]> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/release/`;
        const response = await this.makeRequest('get', url);
        return response?.data;
    }

    public async insertMetrics(
        { orgId, productId, repoId }: MSGBaseInfo,
        metrics?: string
    ): Promise<undefined> {
        if (!(orgId && productId && repoId) || !metrics)
            return Promise.reject(INSUFFICIENT_ERROR);

        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/collectors/sonarqube/`;
        const jsonData = JSON.parse(metrics);
        const response = await this.makeRequest('post', url, jsonData);
        return response?.data;
    }

    public async calculateMeasures({
        orgId,
        productId,
        repoId,
    }: MSGBaseInfo): Promise<ResponseCalculateMeasures[]> {
        if (!(orgId && productId && repoId))
            return Promise.reject(INSUFFICIENT_ERROR);

        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/measures/`;
        const data = {
            measures: [
                { key: 'passed_tests' },
                { key: 'test_builds' },
                { key: 'test_coverage' },
                { key: 'non_complex_file_density' },
                { key: 'commented_file_density' },
                { key: 'duplication_absense' },
            ],
        };
        const response = await this.makeRequest('post', url, data);
        return response?.data;
    }

    public async calculateCharacteristics({
        orgId,
        productId,
        repoId,
    }: MSGBaseInfo): Promise<ResponseCalculateCharacteristics[]> {
        if (!(orgId && productId && repoId))
            return Promise.reject(INSUFFICIENT_ERROR);

        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/characteristics/`;
        const data = {
            characteristics: [
                { key: 'reliability' },
                { key: 'maintainability' },
            ],
        };
        const response = await this.makeRequest('post', url, data);
        return response?.data;
    }

    public async calculateSubCharacteristics({
        orgId,
        productId,
        repoId,
    }: MSGBaseInfo): Promise<ResponseCalculateSubcharacteristics[]> {
        if (!(orgId && productId && repoId))
            return Promise.reject(INSUFFICIENT_ERROR);

        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/subcharacteristics/`;
        const data = {
            subcharacteristics: [
                { key: 'modifiability' },
                { key: 'testing_status' },
            ],
        };
        const response = await this.makeRequest('post', url, data);
        return response?.data;
    }

    public async calculateTSQMI({
        orgId,
        productId,
        repoId,
    }: MSGBaseInfo): Promise<ResponseCalculateTSQMI> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/tsqmi/`;
        if (!(orgId && productId && repoId))
            return Promise.reject(INSUFFICIENT_ERROR);

        const response = await this.makeRequest('post', url);
        return response?.data;
    }

    public async getCurrentConfigs({
        orgId,
        productId,
    }: MSGBaseInfo): Promise<MSGConfig> {
        if (!(orgId && productId)) return Promise.reject(INSUFFICIENT_ERROR);

        const url = MSGBaseUris.getProductDetail(orgId, productId);
        console.debug(`Built Uri: ${url}`);
        let resp = await this.makeRequest('get', url);

        const { data }: AxiosResponse<Product> = resp as AxiosResponse<Product>;
        const actions = data?.actions;

        const currentConfigUri: string =
            actions && actions['get current pre-config']
                ? (actions['get current pre-config'] as string)
                : '';

        if (currentConfigUri === '')
            return Promise.reject(
                `Error. It wasn't possible to get products actions urls. Check if you generated a release.`
            );

        let pre_config: AxiosResponse<MSGConfig> = (await this.makeRequest(
            'get',
            currentConfigUri
        )) as AxiosResponse<MSGConfig>;

        if (!pre_config?.data.created_config)
            return Promise.reject(
                `Error: The user didn't created a release configuration. Please go to your MeasureSoftgram account and create one for this product.`
            );

        return pre_config?.data;
    }
}

export class MSGCalc {
    public static async calculate(
        msgInfo: MSGBaseInfo,
        msgCalcRequest: (
            msgInfo: MSGBaseInfo,
            postArgs?: string
        ) => Promise<any>,
        postArgs?: string
    ): Promise<any> {
        const configs = await new RequestService().getCurrentConfigs(msgInfo);
        if (configs) return msgCalcRequest(msgInfo, postArgs);
        else
            return Promise.reject(
                `Error: The current configurations couldn't be recovered.`
            );
    }
}
