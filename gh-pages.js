"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const gh_pages_1 = __importDefault(require("gh-pages"));
const { GITHUB_BASE_PATH = '../out', GITHUB_BRANCH = 'master', GITHUB_REPO = 'git@github.com:rob-myers/rob-myers.github.io', GITHUB_USER = 'Robert S. R. Myers', GITHUB_EMAIL = 'me.robmyers@gmail.com', } = process.env;
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Pushing directory "${path_1.default.resolve(__dirname, GITHUB_BASE_PATH)}" to branch "${GITHUB_BRANCH}" (gh-pages)`);
    try {
        yield new Promise(resolve => {
            gh_pages_1.default.publish(GITHUB_BASE_PATH, {
                branch: GITHUB_BRANCH,
                repo: GITHUB_REPO,
                user: {
                    name: GITHUB_USER,
                    email: GITHUB_EMAIL,
                },
                dotfiles: true,
            }, resolve);
        });
    }
    catch (e) {
        console.error(e);
    }
}))();
