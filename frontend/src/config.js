// Configuration file

const config = {
  // githubRepoURL: import.meta.env.VITE_GITHUB_REPOSITORY,
  githubRepoURL: "https://github.com/stackhaus-hg/reactive-cursors",
  websiteURL: "https://stackhaus-hg.github.io/reactive-cursors/",
};

// Notes about import.meta.env:
//  This is a standard ES module feature, part of the ECMAScript 2021 specification, providing metadata about the current module
//  Frontend build tools like Vite leverage import.meta.env to expose environment variables defined in .env files to the client-side code during the build process
//  Differences:
//    process.env is inherently tied to Node.js, while import.meta.env is a browser-friendly standard
//    process.env is not directly available in the browser without polyfills. import.meta.env is specifically designed to be accessible in client-side code through build tool transformations
//    Frontend build tools often require a specific prefix (e.g., VITE_ for Vite) for environment variables to be exposed via import.meta.env to the client-side. process.env does not have this requirement

// Make configuration data available to our application
export default config;
