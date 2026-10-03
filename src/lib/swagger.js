import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api/v1',
    definition: {
      info: {
        title: "Documentação API Connect",
        version: "1.0.0"
      }
    }
  });
  return spec;
};