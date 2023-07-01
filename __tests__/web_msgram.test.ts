import axios from "axios";
import MsGramWeb from "../src/msgram";
import { Info, MSGramAccount, getMSGramAccount } from "../src/utils";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Access account", () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:

    mockedAxios.create.mockClear();
    mockedAxios.get.mockClear();
  });

  test("getCurrentConfigs should make a correct axios call", async () => {
    const info: Info = {
      host: "http://localhost:8080/api/v1",
      token: "123456",
      project: {
        projectKey: "projectKey",
      },
    };

    const repo_info = {
      owner: 'owner',
      name: 'repo'
    }

    const measuresResponse = {
      data: {
        paging: {
          pageIndex: 1,
          pageSize: 10,
          total: 50,
        },
        baseComponent: {},
        components: [],
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };

    mockedAxios.get.mockImplementationOnce(async (url, options) => {
      console.log(`URL: ${url}`);
      console.log(`Options: ${JSON.stringify(options)}`);
      if (
        url ===
        `/api/v1/organization`
      ) {
        return Promise.resolve(measuresResponse);
      }
      return Promise.reject("Unexpected URL or options");
    });

    mockedAxios.create.mockImplementationOnce(() => mockedAxios);

    const msGramWeb = new MsGramWeb(info);
    try {
      const measures = await msGramWeb.getCurrentConfigs();
      expect(measures).toBe(measuresResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/api/v1/organization`
      );
    } catch (error) {
      console.log("Error in test: ", error);
      throw error;
    }
  });

  // test("getMeasures should handle axios errors", async () => {
  //   const info: Info = {
  //     host: "http://localhost:9000",
  //     token: "123456",
  //     project: {
  //       projectKey: "projectKey",
  //     },
  //   };

  //   mockedAxios.get.mockImplementationOnce(async () => {
  //     return Promise.reject(new Error("API call failed"));
  //   });

  //   mockedAxios.create.mockImplementationOnce(() => mockedAxios);

  //   const sonarqube = new Sonarqube(info);
  //   const pageSize = 500;
  //   await expect(sonarqube.getMeasures({ pageSize })).rejects.toThrow(
  //     "Error getting project measures from SonarQube. Please make sure you provided the host and token inputs."
  //   );
  // });

  // test("getMeasures should handle non-200 status codes", async () => {
  //   const info: Info = {
  //     host: "http://localhost:9000",
  //     token: "123456",
  //     project: {
  //       projectKey: "projectKey",
  //     },
  //   };

  //   mockedAxios.get.mockImplementationOnce(async () => {
  //     return Promise.resolve({
  //       status: 400, // Non-200 status
  //       data: null, // No data
  //     });
  //   });

  //   mockedAxios.create.mockImplementationOnce(() => mockedAxios);

  //   const sonarqube = new Sonarqube(info);
  //   const pageSize = 500;
  //   await expect(sonarqube.getMeasures({ pageSize })).rejects.toThrow(
  //     "Error getting project measures from SonarQube. Please make sure you provided the host and token inputs."
  //   );
  // });
});
