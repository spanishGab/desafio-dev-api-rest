import CPF from './CPF';

describe('#CPF.isValid.SuiteTests', () => {
  test.each([
    {
      input: '36226370050',
      expectedResult: true,
    },
    {
      input: '92236202016',
      expectedResult: true,
    },
    {
      input: '362.263.700-50',
      expectedResult: true,
    },
    {
      input: '9223620201',
      expectedResult: false,
    },
    {
      input: '15489576322',
      expectedResult: false,
    },
    {
      input: '154895a6322',
      expectedResult: false,
    },
  ])('CPF.isValid($input)', ({input, expectedResult}) => {
    const cpf = new CPF(input);

    expect(cpf.isValid()).toBe(expectedResult);
  })
})
