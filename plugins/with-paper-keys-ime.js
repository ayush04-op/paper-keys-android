const fs = require("node:fs");
const path = require("node:path");
const {
  createRunOncePlugin,
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  withMainApplication,
} = require("@expo/config-plugins");

function withPaperKeysIme(config) {
  const appPackage = config.android?.package;
  if (!appPackage)
    throw new Error(
      "Paper Keys needs android.package to register its input method.",
    );
  const serviceClass = `${appPackage}.PaperKeysInputMethodService`;

  config = withAndroidManifest(config, (mod) => {
    const application = mod.modResults.manifest.application?.[0];
    if (!application)
      throw new Error("Android manifest has no application element.");
    const services = application.service ?? [];
    const existing = services.find(
      (entry) => entry.$?.["android:name"] === serviceClass,
    );
    if (!existing) {
      services.push({
        $: {
          "android:name": serviceClass,
          "android:label": "Paper Keys",
          "android:permission": "android.permission.BIND_INPUT_METHOD",
          "android:exported": "true",
        },
        "intent-filter": [
          { action: [{ $: { "android:name": "android.view.InputMethod" } }] },
        ],
        "meta-data": [
          {
            $: {
              "android:name": "android.view.im",
              "android:resource": "@xml/paper_keys_method",
            },
          },
        ],
      });
    }
    application.service = services;
    return mod;
  });

  config = withMainApplication(config, (mod) => {
    let contents = mod.modResults.contents;
    const packageImport = `import ${appPackage}.PaperKeysPreferencesPackage`;
    if (!contents.includes(packageImport)) {
      const packageLine = contents.match(/^package [^\n]+/m)?.[0];
      if (!packageLine)
        throw new Error(
          "Cannot find the package declaration in MainApplication.",
        );
      contents = contents.replace(
        packageLine,
        `${packageLine}\n\n${packageImport}`,
      );
    }
    if (!contents.includes("add(PaperKeysPreferencesPackage())")) {
      const packageListBlock = /(PackageList\(this\)\.packages\.apply\s*\{)/;
      if (!packageListBlock.test(contents)) {
        throw new Error(
          "Cannot find PackageList(this).packages.apply in MainApplication.",
        );
      }
      contents = contents.replace(
        packageListBlock,
        "$1\n        add(PaperKeysPreferencesPackage())",
      );
    }
    if (
      !contents.includes(
        "useDevSupport = BuildConfig.DEBUG && !BuildConfig.PAPER_KEYS_STANDALONE_DEBUG",
      )
    ) {
      const hostFactory =
        /(packageList\s*=\s*PackageList\(this\)\.packages\.apply\s*\{[\s\S]*?\n\s*\})(\n\s*\))/;
      if (!hostFactory.test(contents)) {
        throw new Error(
          "Cannot configure standalone debug loading in MainApplication.",
        );
      }
      contents = contents.replace(
        hostFactory,
        "$1,\n      useDevSupport = BuildConfig.DEBUG && !BuildConfig.PAPER_KEYS_STANDALONE_DEBUG$2",
      );
    }
    mod.modResults.contents = contents;
    return mod;
  });

  config = withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;
    if (
      !contents.includes(
        'debuggableVariants = project.findProperty("paperKeysStandaloneDebug")',
      )
    ) {
      const reactBlock = /react\s*\{\s*/;
      if (!reactBlock.test(contents))
        throw new Error("Cannot find react { } in app/build.gradle.");
      contents = contents.replace(
        reactBlock,
        (match) =>
          `${match}    debuggableVariants = project.findProperty("paperKeysStandaloneDebug") == "true" ? [] : ["debug"]\n`,
      );
    }
    if (!contents.includes("PAPER_KEYS_STANDALONE_DEBUG")) {
      const defaultConfig = /defaultConfig\s*\{/;
      if (!defaultConfig.test(contents))
        throw new Error("Cannot find defaultConfig { } in app/build.gradle.");
      contents = contents.replace(
        defaultConfig,
        '$&\n        buildConfigField "boolean", "PAPER_KEYS_STANDALONE_DEBUG", (project.findProperty("paperKeysStandaloneDebug") == "true").toString()',
      );
    }
    mod.modResults.contents = contents;
    return mod;
  });

  config = withDangerousMod(config, [
    "android",
    async (mod) => {
      const projectRoot = mod.modRequest.projectRoot;
      const androidRoot = mod.modRequest.platformProjectRoot;
      const packagePath = appPackage.replace(/\./g, path.sep);
      const sourceRoot = path.join(projectRoot, "plugins", "android");
      const javaRoot = path.join(
        androidRoot,
        "app",
        "src",
        "main",
        "java",
        packagePath,
      );
      const resourceRoot = path.join(
        androidRoot,
        "app",
        "src",
        "main",
        "res",
        "xml",
      );
      fs.mkdirSync(javaRoot, { recursive: true });
      fs.mkdirSync(resourceRoot, { recursive: true });
      for (const file of [
        "PaperKeysInputMethodService.kt",
        "PaperKeysPreferencesModule.kt",
        "PaperKeysPreferencesPackage.kt",
      ]) {
        const source = fs.readFileSync(path.join(sourceRoot, file), "utf8");
        fs.writeFileSync(
          path.join(javaRoot, file),
          source.replaceAll("__APP_PACKAGE__", appPackage),
        );
      }
      fs.copyFileSync(
        path.join(sourceRoot, "paper_keys_method.xml"),
        path.join(resourceRoot, "paper_keys_method.xml"),
      );
      return mod;
    },
  ]);

  return config;
}

module.exports = createRunOncePlugin(
  withPaperKeysIme,
  "with-paper-keys-ime",
  "1.0.0",
);
