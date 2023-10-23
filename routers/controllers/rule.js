import * as BodyValidator from "simple-body-validator";

export const StoreHash = {
	hash: ["required", "string", "size:64"],
	did: ["string"],
};

export const UpdateHash = {
	newHash: ["required", "string", "size:64"],
	did: ["string"],
	config: ["object"],
	'config.type': ["required", "string", "size:8", BodyValidator.ruleIn(["document"])],
	'config.policy': ["object", "min:4", "max:5"],
	'config.policy.id': ["required", "string", "size:56"],
	'config.policy.script': ["required", "string", "size:84"],
	'config.policy.ttl': ["required", "integer"],
	'config.policy.reuse': ["strict", "boolean"],
	'config.asset': ["required", "string", "size:120"],
	'config.burn': ["strict", "boolean"],
	'config.txHash': ["string"],
};

export const RevokeHash = {
	config: ["object"],
	'config.type': ["required", "string", "size:8", BodyValidator.ruleIn(["document"])],
	'config.policy': ["object", "min:4", "max:5"],
	'config.policy.id': ["required", "string", "size:56"],
	'config.policy.script': ["required", "string", "size:84"],
	'config.policy.ttl': ["required", "integer"],
	'config.policy.reuse': ["strict", "boolean"],
	'config.asset': ["required", "string", "size:120"],
	'config.txHash': ["string"],
	burnAll: ["boolean"],
};

export const StoreCredential = {
	credential: ["required", "string", "size:64"],
	config: ["object"],
	'config.type': ["required", "string", "min:8", "max:10", BodyValidator.ruleIn(["document", "credential"])],
	'config.policy': ["object", "min:4", "max:5"],
	'config.policy.id': ["required", "string", "size:56"],
	'config.policy.script': ["required", "string", "size:84"],
	'config.policy.ttl': ["required", "integer"],
	'config.policy.reuse': ["strict", "boolean"],
	'config.asset': ["required", "string", "size:120"],
	'config.txHash': ["string"],
};

export const StoreCredentials = {
	credentials: ["required", "array"],
	// 'credentials.*': ["required", "string", "size:64"],
	config: ["object"],
	'config.type': ["required", "string", "min:8", "max:10", BodyValidator.ruleIn(["document", "credential"])],
	'config.policy': ["object", "min:4", "max:5"],
	'config.policy.id': ["required", "string", "size:56"],
	'config.policy.script': ["required", "string", "size:84"],
	'config.policy.ttl': ["required", "integer"],
	'config.policy.reuse': ["strict", "boolean"],
	'config.asset': ["required", "string", "size:120"],
	'config.txHash': ["string"],
};

export const RevokeCredential = {
	config: ["object"],
	'config.type': ["required", "string", "size:10", BodyValidator.ruleIn(["credential"])],
	'config.policy': ["object", "min:4", "max:5"],
	'config.policy.id': ["required", "string", "size:56"],
	'config.policy.script': ["required", "string", "size:84"],
	'config.policy.ttl': ["required", "integer"],
	'config.policy.reuse': ["strict", "boolean"],
	'config.asset': ["required", "string", "size:120"],
	'config.txHash': ["string"],
};

export const VerifySignature = {
	address: ["required", "string"],
	payload: ["required", "string"],
	signature: ["required", "string"],
	key: ["required", "string"],
};