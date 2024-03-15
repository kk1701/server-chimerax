// import GoogleSpreadsheet, {
//   GoogleSpreadsheet as GoogleSheet,
// } from "google-spreadsheet";
// import { PaymentStatus, TeamStatus } from "../models/team";
// import credentials from "./../client.json";
// import TeamModel from "../models/team";
// import { cities } from "../cities";
// import { sortBy } from "lodash";

// export const updateSpreadSheet = async (
//   teamName: string,
//   teamStatus: TeamStatus,
//   teamId: string
// ) => {
//   try {
//     const doc: GoogleSpreadsheet.GoogleSpreadsheet = new GoogleSheet(
//       "15MaHj5QjmWyhuIDCcLrcM3PLB1BPWSiOCh6vTORgCzw"
//     );
//     await doc.useServiceAccountAuth(credentials);
//     await doc.loadInfo();
//     const sheet = doc.sheetsByIndex[0];
//     // const previousRows = await sheet.getRows();
//     // await previousRows.forEach(async (row, index: number) => {
//     //   await row.delete();
//     // });
//     const row = {
//       teamName: teamName,
//       teamStatus: teamStatus,
//       teamId: teamId,
//       status: "PAID",
//     };
//     await sheet.addRow(row);
//   } catch (e) {
//     // console.log("error", e);
//   }
// };

// export const updateInternalSheet = async () => {
//   try {
//     // console.log("worked");
//     const doc: GoogleSpreadsheet.GoogleSpreadsheet = new GoogleSheet(
//       "1jNbPJGLE7mOdZJBWy0h4lEOWPyYI3TkW7BArGv-wQWk"
//     );
//     await doc.useServiceAccountAuth(credentials);
//     await doc.loadInfo();
//     const sheet = doc.sheetsByIndex[0];
//     const previousRows = await sheet.getRows();
//     // console.log(previousRows);
//     await previousRows.forEach(async (row, index: number) => {
//       await row.delete();
//     });

//     const rows = await Promise.all(
//       cities.map(async (city) => {
//         const count = await TeamModel.countDocuments({
//           status: PaymentStatus.PAID,
//           city: city.name,
//         });
//         return {
//           city: city.name,
//           registrations: count,
//         };
//       })
//     );
//     // console.log("rows", rows);
//     await sheet.addRows(rows);
//   } catch (e) {
//     // console.log("error", e);
//   }
// };
