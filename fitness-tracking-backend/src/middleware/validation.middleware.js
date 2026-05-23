const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map((d) => ({ path: d.path.join('.'), message: d.message })),
    });
  }

  req[source] = value;
  return next();
};

module.exports = { validate };
