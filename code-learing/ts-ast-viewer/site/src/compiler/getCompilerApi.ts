import { CompilerPackageNames } from "@ts-ast-viewer/shared";
import { CompilerApi } from "./CompilerApi";
import {
  importCompilerApi,
  importLibFiles,
} from "./compilerVersions.generated";

const compilerTypes: { [name: string]: Promise<CompilerApi> } = {};
const compilerTypesLoaded: { [name: string]: true } = {};

export function getCompilerApi(
  packageName: CompilerPackageNames
): Promise<CompilerApi> {
  if (compilerTypes[packageName] == null) {
    compilerTypes[packageName] = loadCompilerApi(packageName);
    compilerTypes[packageName].catch(() => delete compilerTypes[packageName]);
  }
  return compilerTypes[packageName];
}

export function hasLoadedCompilerApi(packageName: CompilerPackageNames) {
  return compilerTypesLoaded[packageName] === true;
}

/**
 * 加载编译器 api 以及相关 lib
 * @param packageName
 * @returns
 */
async function loadCompilerApi(packageName: CompilerPackageNames) {
  const libFilesPromise = importLibFiles(packageName);
  // 加载编译器 core api
  const compilerApiPromise = importCompilerApi(packageName);
  const api = { ...((await compilerApiPromise) as any as CompilerApi) };

  api.tsAstViewer = {
    packageName,
    cachedSourceFiles: {},
  };
  const libFiles = await libFilesPromise;

  // 动态引入 site\src\resources\libFiles\typescript 中的 ts 文件
  for (const sourceFile of getLibSourceFiles()) {
    api.tsAstViewer.cachedSourceFiles[sourceFile.fileName] = sourceFile;
  }

  compilerTypesLoaded[packageName] = true;

  return api;

  function getLibSourceFiles() {
    return Object.keys(libFiles)
      .map(
        (key) => (libFiles as any)[key] as { fileName: string; text: string }
      )
      .map((libFile) =>
        api.createSourceFile(
          libFile.fileName,
          libFile.text,
          api.ScriptTarget.Latest,
          false,
          api.ScriptKind.TS
        )
      );
  }
}
