import Joi from 'joi';
import { DateTime } from 'luxon';
import { cpfField, dateField } from './fields';

describe('#fields.dateField.SuiteTests', () => {
  test.each([
    {
      input: '2022-08-31',
      expectedOutput: '2022-08-31',
    },
    {
      input: '2022-08-31T08:09:59.000',
      expectedOutput: '2022-08-31T08:09:59.000',
    },
  ])('Should return a valid DateTime for $input', async ({ input, expectedOutput }) => {
    const result = await dateField.validateAsync(input);

    expect(result).toBe(expectedOutput);
  });

  test.each([
    {
      input: '31/08/2022',
      expectedOutput: 'Invlaid date',
    },
    {
      input: '31.08.2022',
      expectedOutput: 'Invlaid date',
    },
    {
      input: '2022-13-31',
      expectedOutput: 'Invlaid date',
    },
  ])('Should throw an error for the invalid date $input', async ({ input, expectedOutput }) => {
    try {
      await dateField.messages({'date.base': expectedOutput}).validateAsync(input);
    } catch (error) {
      expect(error).toBeInstanceOf(Joi.ValidationError);
      expect(error.message).toBe(expectedOutput);
    }
  });
});

describe('#fields.cpfField.SuiteTests', () => {
  test.each([
    {
      input: '36226370050',
      expectedOutput: '36226370050',
    },
    {
      input: '92236202016',
      expectedOutput: '92236202016',
    },
    {
      input: '362.263.700-50',
      expectedOutput: '36226370050',
    },
  ])('Should return a valid CPF code for $input', async ({ input, expectedOutput }) => {
    const result = await cpfField.validateAsync(input);

    expect(result).toBe(expectedOutput);
  });

  test.each([
    {
      input: '9223620201',
      expectedOutput: 'Invlaid CPF code',
    },
    {
      input: '15489576322',
      expectedOutput: 'Invlaid CPF code',
    },
    {
      input: '154895a6322',
      expectedOutput: 'Invlaid CPF code',
    },
  ])('Should throw an error for the invalid CPF $input', async ({ input, expectedOutput }) => {
    try {
      await cpfField.messages({'cpf.base': expectedOutput}).validateAsync(input);
    } catch (error) {
      expect(error).toBeInstanceOf(Joi.ValidationError);
      expect(error.message).toBe(expectedOutput);
    }
  });
});
