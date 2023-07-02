import { MSGConfig } from './indicators_i';
import * as fs from 'fs/promises';
import * as io from '@actions/io';

const saveMSGJson = async (config: MSGConfig): Promise<string> => {
    const path = '.msgram/msgram.json';
    io.mkdirP('.msgram');
    return fs
        .writeFile(path, JSON.stringify(config))
        .then((ans) => {
            console.debug('Wrote .json: ', ans);
            return path;
        })
        .catch((err) => {
            console.debug(err);
            throw new Error('Not possible to write .json');
        });
};

export default saveMSGJson;
