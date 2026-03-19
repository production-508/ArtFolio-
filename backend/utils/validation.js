const { z } = require('zod');

// Middleware de validation générique
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
};

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(50, "Le nom est trop long"),
  email: z.string().email("L'email est invalide").toLowerCase().trim(),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(100),
  role: z.enum(['artist', 'collector']).default('collector')
});

const loginSchema = z.object({
  email: z.string().email("L'email est invalide").toLowerCase().trim(),
  password: z.string().min(1, "Le mot de passe est requis")
});

const artworkSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères").max(100),
  medium: z.string().min(2, "Le médium est requis"),
  style: z.string().min(2, "Le style est requis"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Le prix doit être positif"),
  available: z.coerce.boolean().default(true),
  year: z.string().optional(),
  dimensions: z.string().optional()
  // NOTE: image_url ou les fichiers seront gérés à part par multer
});

const resetPasswordRequestSchema = z.object({
  email: z.string().email("L'email est invalide").toLowerCase().trim()
});

const resetPasswordSubmitSchema = z.object({
  token: z.string().min(1, "Le token est requis"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  artworkSchema,
  resetPasswordRequestSchema,
  resetPasswordSubmitSchema
};
