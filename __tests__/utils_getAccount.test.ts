import { MSGramAccount, getMSGramAccount } from "../src/utils";

jest.mock('@actions/core', () => ({
  getInput: jest.fn().mockImplementation((inputName: string) => {
    const inputs = new Map<string, string>();

    inputs.set('msgUsername', 'mockUser');
    inputs.set('msgEmail', 'mockMail');
    inputs.set('msgPassword', 'mockPass');
    inputs.set('projectKey', 'mockProjectKey');
    inputs.set('host', 'mockHost');
    inputs.set('token', 'mockToken');

    console.debug('inputname: ', inputName);
    let resp = inputs.get(inputName);
    console.debug('resp); ', resp);
    if(resp) return resp;
    return '';
  }),
}));

describe('getMSGramAccount', () => {
    test('should return correct MSGram User object', () => {

    const expectedAccount: MSGramAccount = {
      user: { username: 'mockUser', email: 'mockMail' },
      password: 'mockPass',
    }

    expect(getMSGramAccount()).toEqual(expectedAccount);
  })
})
