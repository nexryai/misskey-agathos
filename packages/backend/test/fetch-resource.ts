process.env.NODE_ENV = "test";

import * as assert from "assert";
import * as childProcess from "child_process";
import * as crypto from "crypto";
import { createSignedPost } from "../src/remote/activitypub/ap-request";
import { genRsaKeyPair } from "../src/misc/gen-key-pair";
import { StatusError, getResponse } from "../src/misc/fetch";
import { async, startServer, signup, post, request, simpleGet, port, shutdownServer } from "./utils.js";

// Request Accept
const ONLY_AP = "application/activity+json";
const PREFER_AP = "application/activity+json, */*";
const PREFER_HTML = "text/html, */*";
const UNSPECIFIED = "*/*";

// Response Contet-Type
const AP = "application/activity+json; charset=utf-8";
const HTML = "text/html; charset=utf-8";

describe("Fetch resource", () => {
    let p: childProcess.ChildProcess;

    let alice: any;
    let alicesPost: any;

    before(async () => {
        p = await startServer();
        alice = await signup({ username: "alice" });
        alicesPost = await post(alice, {
            text: "test",
        });
    });

    after(async () => {
        await shutdownServer(p);
    });

    describe("Common", () => {
        it("meta", async(async () => {
            const res = await request("/meta", {
            });

            assert.strictEqual(res.status, 200);
        }));

        it("GET root", async(async () => {
            const res = await simpleGet("/");
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, HTML);
        }));

        it("GET docs", async(async () => {
            const res = await simpleGet("/docs/ja-JP/about");
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, HTML);
        }));

        it("GET favicon.ico", async(async () => {
            const res = await simpleGet("/favicon.ico");
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "image/x-icon");
        }));

        it("GET apple-touch-icon.png", async(async () => {
            const res = await simpleGet("/apple-touch-icon.png");
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "image/png");
        }));

        it("GET twemoji svg", async(async () => {
            const res = await simpleGet("/twemoji/2764.svg");
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "image/svg+xml");
        }));

        it("GET twemoji svg with hyphen", async(async () => {
            const res = await simpleGet("/twemoji/2764-fe0f-200d-1f525.svg");
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "image/svg+xml");
        }));
    });

    describe("/@:username", () => {
        it("Only AP => AP", async(async () => {
            const res = await simpleGet(`/@${alice.username}`, ONLY_AP);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, AP);
        }));

        it("Prefer AP => AP", async(async () => {
            const res = await simpleGet(`/@${alice.username}`, PREFER_AP);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, AP);
        }));

        it("Prefer HTML => HTML", async(async () => {
            const res = await simpleGet(`/@${alice.username}`, PREFER_HTML);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, HTML);
        }));

        it("Unspecified => HTML", async(async () => {
            const res = await simpleGet(`/@${alice.username}`, UNSPECIFIED);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, HTML);
        }));
    });

    describe("/users/:id", () => {
        it("Only AP => AP", async(async () => {
            const res = await simpleGet(`/users/${alice.id}`, ONLY_AP);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, AP);
        }));

        it("Prefer AP => AP", async(async () => {
            const res = await simpleGet(`/users/${alice.id}`, PREFER_AP);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, AP);
        }));

        it("Prefer HTML => Redirect to /@:username", async(async () => {
            const res = await simpleGet(`/users/${alice.id}`, PREFER_HTML);
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.location, `/@${alice.username}`);
        }));

        it("Undecided => HTML", async(async () => {
            const res = await simpleGet(`/users/${alice.id}`, UNSPECIFIED);
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.location, `/@${alice.username}`);
        }));
    });

    describe("/notes/:id", () => {
        it("Only AP => AP", async(async () => {
            const res = await simpleGet(`/notes/${alicesPost.id}`, ONLY_AP);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, AP);
        }));

        it("Prefer AP => AP", async(async () => {
            const res = await simpleGet(`/notes/${alicesPost.id}`, PREFER_AP);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, AP);
        }));

        it("Prefer HTML => HTML", async(async () => {
            const res = await simpleGet(`/notes/${alicesPost.id}`, PREFER_HTML);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, HTML);
        }));

        it("Unspecified => HTML", async(async () => {
            const res = await simpleGet(`/notes/${alicesPost.id}`, UNSPECIFIED);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, HTML);
        }));
    });

    describe("Feeds", () => {
        it("RSS", async(async () => {
            const res = await simpleGet(`/@${alice.username}.rss`, UNSPECIFIED);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "application/rss+xml; charset=utf-8");
        }));

        it("ATOM", async(async () => {
            const res = await simpleGet(`/@${alice.username}.atom`, UNSPECIFIED);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "application/atom+xml; charset=utf-8");
        }));

        it("JSON", async(async () => {
            const res = await simpleGet(`/@${alice.username}.json`, UNSPECIFIED);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "application/json; charset=utf-8");
        }));
    });

    describe("inbox", async () => {
        const myInbox = `http://localhost:${port}/inbox`;

        const myHost = "misskey.local";
        const xHost = "xxx.local";

        const inboxPost = async (url: string, headers: Record<string, string>, body: string) => {
            const res = await getResponse({
                url,
                method: "POST",
                headers,
                body,
                timeout: 10 * 1000,
            }).then(r => {
                return {
                    statusCode: r.status,
                    statusMessage: r.statusText,
                    body: r.body,
                };
            }).catch(err => {
                if (err instanceof StatusError) {
                    return {
                        statusCode: err.statusCode,
                        statusMessage: err.statusMessage,
                    };
                } else {
                    throw err;
                }
            });
            return res;
        };

        // 鍵はここでは検証しないのでなんでもいい
        let keyPair: any;
        let key: any;

        before(async () => {
            keyPair = await genRsaKeyPair();
            key = {
                privateKeyPem: keyPair.privateKey,
                keyId: `https://${myHost}/users/a#main-key`,
            };
        });

        it("Accepted", async () => {
            const object = { a: 1, b: 2 };
            const body = JSON.stringify(object);

            const req = createSignedPost({
                key,
                url: myInbox,
                body,
                additionalHeaders: {
                    Host: myHost,
                },
            });

            const res = await inboxPost(myInbox, req.request.headers, body);

            assert.strictEqual(res.statusCode, 202);
        });

        it("Invalid Host", async () => {
            const object = { a: 1, b: 2 };
            const body = JSON.stringify(object);

            const req = createSignedPost({
                key,
                url: myInbox,
                body,
                additionalHeaders: {
                    Host: xHost,	// ★
                },
            });

            const res = await inboxPost(myInbox, req.request.headers, body);

            assert.strictEqual(res.statusCode, 400);
        });

        it("Payload Too Large", async () => {
            const object = { a: 1, b: "x".repeat(70000) };	// ★
            const body = JSON.stringify(object);

            const req = createSignedPost({
                key,
                url: myInbox,
                body,
                additionalHeaders: {
                    Host: myHost,
                },
            });

            const res = await inboxPost(myInbox, req.request.headers, body);

            assert.strictEqual(res.statusCode, 413);
        });

        it("Signature Header Required", async () => {
            const object = { a: 1, b: 2 };
            const body = JSON.stringify(object);

            const req = createSignedPost({
                key,
                url: myInbox,
                body,
                additionalHeaders: {
                    Host: myHost,
                },
            });

            delete req.request.headers.signature;	// ★

            const res = await inboxPost(myInbox, req.request.headers, body);

            assert.strictEqual(res.statusCode, 401);
            //assert.strictEqual(res.statusMessage, 'Signature Header Required');
        });

        it("Digest Header Required", async () => {
            const object = { a: 1, b: 2 };
            const body = JSON.stringify(object);

            const req = createSignedPost({
                key,
                url: myInbox,
                body,
                additionalHeaders: {
                    Host: myHost,
                },
            });

            delete req.request.headers.digest;	// ★

            const res = await inboxPost(myInbox, req.request.headers, body);

            assert.strictEqual(res.statusCode, 401);
            //assert.strictEqual(res.statusMessage, 'Digest Header Required');
        });

        it("Invalid Digest Header", async () => {
            const object = { a: 1, b: 2 };
            const body = JSON.stringify(object);

            const req = createSignedPost({
                key,
                url: myInbox,
                body,
                additionalHeaders: {
                    Host: myHost,
                },
            });

            req.request.headers.digest = "puee";	// ★

            const res = await inboxPost(myInbox, req.request.headers, body);

            assert.strictEqual(res.statusCode, 401);
            //assert.strictEqual(res.statusMessage, "Invalid Digest Header");
        });

        it("Unsupported Digest Algorithm", async () => {
            const object = { a: 1, b: 2 };
            const body = JSON.stringify(object);

            const req = createSignedPost({
                key,
                url: myInbox,
                body,
                additionalHeaders: {
                    Host: myHost,
                },
            });

            req.request.headers.digest = "SHA-5000=abc";	// ★

            const res = await inboxPost(myInbox, req.request.headers, body);

            assert.strictEqual(res.statusCode, 401);
            //assert.strictEqual(res.statusMessage, "Unsupported Digest Algorithm");
        });

        it("Digest Missmath", async () => {
            const object = { a: 1, b: 2 };
            const body = JSON.stringify(object);

            const req = createSignedPost({
                key,
                url: myInbox,
                body,
                additionalHeaders: {
                    Host: myHost,
                },
            });

            req.request.headers.digest = `SHA-256=${crypto.createHash("sha256").update("puppukupu-").digest("base64")}`;

            const res = await inboxPost(myInbox, req.request.headers, body);

            assert.strictEqual(res.statusCode, 401);
            //assert.strictEqual(res.statusMessage, "Digest Missmatch");
        });
    });
});
