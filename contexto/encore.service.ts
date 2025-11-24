import { Service } from "encore.dev/service";

// Encore will consider this directory and all its subdirectories as part of the "contexto" service.
// https://encore.dev/docs/ts/primitives/services

// The contexto service is used to store and retrieve contexto words by date.
export default new Service("contexto");
