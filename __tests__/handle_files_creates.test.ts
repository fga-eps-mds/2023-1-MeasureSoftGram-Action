import saveMSGJson from '../src/handleFiles';
import * as fs from 'fs/promises';
import * as io from '@actions/io';
import { bodyCurrentConfigsResponse } from './test-data/api-response';

describe('Must handle msgram.json', () => {
    const config = bodyCurrentConfigsResponse;

    afterEach(() => {
        fs.writeFile('.msgram/msgram.json', '');
    });

    afterAll(() => {
        io.rmRF('.msgram/msgram.json');
        io.rmRF('.msgram');
    });

    test('creates the correct file', async () => {
        await saveMSGJson(config);
        const file = await fs.open('.msgram/msgram.json');

        expect(file.stat().then((stat) => stat.isFile())).toBeTruthy;

        const ans = await file.readFile();
        const objAns = JSON.parse(ans.toString());

        expect(objAns).toEqual(config);
    });

    test('supperposes existing file', async () => {
        await saveMSGJson(config);
        const file = await fs.open('.msgram/msgram.json');

        expect(file.stat().then((stat) => stat.isFile())).toBeTruthy;

        const ans = await file.readFile();
        const objAns = JSON.parse(ans.toString());

        await saveMSGJson({ ...config, id: 80 });
        const file2 = await fs.open('.msgram/msgram.json');

        const ans2 = await file2.readFile();
        const objAns2 = JSON.parse(ans2.toString());

        expect(objAns).toEqual(config);
        expect(objAns2).toEqual({ ...config, id: 80 });
        expect(objAns).not.toEqual(objAns2);
    });
});
