// import loadtest from "loadtest";

// const options: loadtest.LoadTestOptions = {
//   url: "http://localhost:8080/register",
//   concurrency: 5,
//   method: "POST",
//   body: "",
//   requestsPerSecond: 30,
//   maxSeconds: 30,
//   requestGenerator: (params, options, client, callback) => {
//     // options.headers["Content-Length"] = message.length;
//     options.headers["Content-Type"] = "application/json";
//     options.body = { email: "Fasdas@gmail.com", password: "Flash@123" };
//     options.path = "YourURLPath";
//     const request = client(options, callback);
//     // request.write(message);
//     return request;
//   },
// };
// console.log("exec");

// loadtest.loadTest(options, (error: any, results: any) => {
//   if (error) {
//     return console.error(`Got an error: ${error}`);
//   }
//   console.log("Tests run successfully", { results });
// });
