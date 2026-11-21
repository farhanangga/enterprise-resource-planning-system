// import { Suspense } from "react";

// type User = {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
// };

// type ApiResponse = {
//   success: boolean;
//   message: string;
//   data: User[];
// };

// async function getUsers(): Promise<User[]> {
//   const apiUrl = process.env.API_URL || "http://localhost:3001";
//   const apiKey = process.env.API_SECRET_KEY;

//   if (!apiKey) {
//     throw new Error("API_SECRET_KEY is not configured in frontend");
//   }

//   const response = await fetch(`${apiUrl}/api/users`, {
//     method: "GET",
//     headers: {
//       "x-api-key": apiKey,
//     },
//     cache: "no-store",
//   });

//   const responseData = await response.text();

//   console.log("API Status:", response.status);
//   console.log("API Response:", responseData);

//   if (!response.ok) {
//     throw new Error(
//       `Failed to fetch users: ${response.status} - ${responseData}`
//     );
//   }

//   const result: ApiResponse = JSON.parse(responseData);

//   if (!result.success) {
//     throw new Error(result.message || "Failed to retrieve users");
//   }

//   return result.data;
// }

// // Component untuk menampilkan data users
// async function UserList() {
//   const users = await getUsers();

//   if (users.length === 0) {
//     return (
//       <p className="text-gray-500">
//         No users found.
//       </p>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {users.map((user) => (
//         <div
//           key={user.id}
//           className="border border-gray-200 rounded-lg p-4"
//         >
//           <h2 className="font-bold text-lg">
//             {user.name}
//           </h2>

//           <p className="text-gray-600">
//             {user.email}
//           </p>

//           <p className="text-sm text-gray-500">
//             Role: {user.role}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// }

// // Loading component
// function UserLoading() {
//   return (
//     <div className="space-y-4">
//       {[1, 2, 3].map((item) => (
//         <div
//           key={item}
//           className="border rounded-lg p-4 animate-pulse"
//         >
//           <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
//           <div className="h-4 w-56 bg-gray-200 rounded mb-2" />
//           <div className="h-3 w-24 bg-gray-200 rounded" />
//         </div>
//       ))}
//     </div>
//   );
// }

// // Main page
// export default function Home() {
//   return (
//     <main className="min-h-screen p-10 bg-gray-50">
//       <div className="max-w-4xl mx-auto">

//         <h1 className="text-2xl font-bold mb-2">
//           Enterprise Management System
//         </h1>

//         <p className="text-gray-500 mb-8">
//           User Management
//         </p>

//         <section>
//           <h2 className="text-xl font-semibold mb-5">
//             Users List
//           </h2>

//           <Suspense fallback={<UserLoading />}>
//             <UserList />
//           </Suspense>
//         </section>

//       </div>
//     </main>
//   );
// }
