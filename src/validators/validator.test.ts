import Joi from 'joi';
import { RequestError } from '../errors/requestErrors';
import { Validator } from './validator';

describe('#Validator.validateFieldsBySchema.SuiteTests', () => {
  it('Should validate a schema sucessfully', async () => {
    const fields = {
      myCar: 'Honda Civic',
      year: 2020,
    };

    const schema = Joi.object({
      myCar: Joi.string().required(),
      year: Joi.number().positive(),
    });

    const result = await Validator.validateFieldsBySchema(fields, schema);

    expect(result).toStrictEqual(fields);
  });

  test.each([
    {
      expectedResult: new RequestError('ValidationError', [
        { attribute: 'name', message: 'Invalid Name' },
      ]),
      field: {
        name: 2,
      },
      schema: Joi.object({
        name: Joi.string().required().messages({ '*': 'Invalid Name' }),
      }),
    },
    {
      expectedResult: new RequestError('ValidationError', [
        { attribute: 'name', message: 'Invalid Name' },
        { attribute: 'age', message: 'Invalid Age' },
      ]),
      field: {
        name: 2,
        age: false,
      },
      schema: Joi.object({
        name: Joi.string().required().messages({ '*': 'Invalid Name' }),
        age: Joi.number().required().positive().messages({ '*': 'Invalid Age' }),
      }),
    }
  ])('validateFieldsBySchema() throwing errors', async ({expectedResult, field, schema}) => {
    try {
      await Validator.validateFieldsBySchema(field, schema);
    } catch(validationError) {
      expect(validationError).toBeInstanceOf(RequestError);
      expect(validationError).toStrictEqual(expectedResult);
    }

  });
});
