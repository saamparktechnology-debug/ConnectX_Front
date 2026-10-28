const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = function withZegoBuildConfig(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      // Add a subprojects block to enable buildConfig for the Zego module
      config.modResults.contents = config.modResults.contents.replace(
        /allprojects\s*\{/,
        `allprojects {
    subprojects {
        if (project.name.contains("zego-express-engine-reactnative")) {
            afterEvaluate { project ->
                if (project.hasProperty('android')) {
                    project.android.buildFeatures.buildConfig = true
                }
            }
        }
    }`,
      );
    }
    return config;
  });
};
