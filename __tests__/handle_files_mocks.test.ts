import * as fs from 'fs/promises';
import saveMSGJson from '../src/handleFiles';
import { bodyCurrentConfigsResponse } from './test-data/api-response';
import { MSGConfig } from '../src/indicators_i';

jest.mock('fs/promises', () => {
    return {
        ...jest.requireActual('fs/promises'),
        writeFile: jest.fn()
    };
});

describe('File creation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fs.writeFile as jest.Mock).mockReset();

  });
    const config: MSGConfig = bodyCurrentConfigsResponse;
    test('msg json must be created', async () => {
        (fs.writeFile as jest.Mock).mockResolvedValue(Promise.resolve());
        const mockedWrite = jest.spyOn(fs, 'writeFile');

        await saveMSGJson(config);
        expect(mockedWrite).toHaveBeenCalled();
        expect(mockedWrite).toHaveBeenCalledWith(
            '.msgram/msgram.json',
            JSON.stringify(bodyCurrentConfigsResponse)
        );

        mockedWrite.mockRestore();
        jest.restoreAllMocks();
    });

    test('can read msg file contents', async () => {
        (fs.writeFile as jest.Mock).mockRestore();
           });
});
