import { z } from "zod";

/** Marcador para datos que no se han podido verificar. */
export const TODO = "TODO" as const;
const todo = z.literal(TODO);

export const LocalizedSchema = z.object({ es: z.string().min(1), en: z.string().min(1) });
export type Localized = z.infer<typeof LocalizedSchema>;

export const GENDERS = ["male", "female", "nonbinary"] as const;
export const SPECIES = ["human", "radiant", "radivoid", "robot", "other"] as const;
export const AFFILIATIONS = ["protocol", "kingdom", "alpha-omega", "independent"] as const;
export const TIERS = ["Select", "Deluxe", "Premium", "Exclusive", "Ultra"] as const;
export const ABILITY_KEYS = ["C", "Q", "E", "X"] as const;

export type Gender = (typeof GENDERS)[number];
export type Species = (typeof SPECIES)[number];
export type Affiliation = (typeof AFFILIATIONS)[number];
export type Tier = (typeof TIERS)[number];
export type AbilityKey = (typeof ABILITY_KEYS)[number];
export type MaybeTodo<T> = T | typeof TODO;

/* ---------- datos manuales ---------- */

/**
 * `origin`: códigos ISO 3166-1 alfa-2 (se traducen con Intl.DisplayNames) o "unknown".
 * Es un array para soportar coincidencia parcial (naranja) cuando hay varios.
 */
export const AgentManualSchema = z.object({
  gender: z.union([z.enum(GENDERS), todo]),
  species: z.union([z.enum(SPECIES), todo]),
  origin: z.union([z.array(z.string().regex(/^([A-Z]{2}|unknown)$/)).min(1), todo]),
  releaseYear: z.union([z.number().int().min(2020).max(2100), todo]),
  releaseEpisode: z.union([z.string().min(1), todo]),
  ultPoints: z.union([z.number().int().min(1).max(12), todo]),
  affiliation: z.union([z.enum(AFFILIATIONS), todo]),
});
export type AgentManual = z.infer<typeof AgentManualSchema>;
export const AgentsManualSchema = z.record(z.string(), AgentManualSchema);

export const QuoteSchema = z.object({
  agentId: z.string(),
  text: LocalizedSchema,
  /** false = el texto en ese idioma es traducción propia, no la línea doblada oficial. */
  official: z.object({ es: z.boolean(), en: z.boolean() }),
  audioUrl: z.string().url().optional(),
});
export type Quote = z.infer<typeof QuoteSchema>;
export const QuotesSchema = z.array(QuoteSchema);

export const EmojisSchema = z.record(z.string(), z.array(z.string().min(1)).length(5));

/* ---------- datos generados ---------- */

export const AbilitySchema = z.object({
  id: z.string(), // `${agentId}-${key}`
  agentId: z.string(),
  key: z.enum(ABILITY_KEYS),
  name: LocalizedSchema,
  icon: z.string().url(),
});
export type Ability = z.infer<typeof AbilitySchema>;

export const AgentSchema = z.object({
  id: z.string(),
  uuid: z.string(),
  name: LocalizedSchema,
  role: z.object({ id: z.string(), name: LocalizedSchema, icon: z.string().url() }),
  icon: z.string().url(),
  portrait: z.string().url().nullable(),
  ...AgentManualSchema.shape,
});
export type Agent = z.infer<typeof AgentSchema>;

export const TierInfoSchema = z.object({
  id: z.string(),
  name: z.enum(TIERS),
  rank: z.number(),
  icon: z.string().url(),
  color: z.string(),
});
export type TierInfo = z.infer<typeof TierInfoSchema>;

export const SkinSchema = z.object({
  id: z.string(),
  name: LocalizedSchema,
  weapon: z.string(),
  weaponName: LocalizedSchema,
  weaponCategory: z.string(),
  tier: z.enum(TIERS),
  image: z.string().url(),
  isMelee: z.boolean(),
  /** Relación de aspecto (ancho/alto) de la imagen. */
  aspect: z.number().positive(),
  /** Centro del zoom inicial, normalizado 0..1, dentro de zona opaca. */
  poi: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
});
export type Skin = z.infer<typeof SkinSchema>;

/** Máscara de opacidad gruesa por skin (solo para tests). */
export const SkinMaskSchema = z.object({
  id: z.string(),
  grid: z.number().int(),
  /** filas de `grid` caracteres: "1" opaco, "0" transparente */
  rows: z.array(z.string()),
});
export type SkinMask = z.infer<typeof SkinMaskSchema>;
