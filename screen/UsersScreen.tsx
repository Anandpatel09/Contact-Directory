
// import React, { useEffect, useRef } from 'react';

// import {
//   ActivityIndicator,
//   FlatList,
//   Pressable,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';

// import {
//   useAppDispatch,
//   useAppSelector,
// } from '../redux/hooks/reduxHooks';

// import { fetchUsers } from '../redux/usersThunks';

// const UsersScreen = () => {
//   const dispatch = useAppDispatch();

//   // Get users data from Redux store
//   const {
//     users,
//     status,
//     error,
//     skip,
//     limit,
//     total,
//     loadingMore,
//   } = useAppSelector(state => state.users);

//   // Prevent multiple API requests at the same time
//   const loadingMoreRef = useRef(false);

//   // Fetch first 10 users when screen loads
//   useEffect(() => {
//     if (status === 'idle') {
//       dispatch(fetchUsers({ skip: 0, limit: 10 }));
//     }
//   }, [dispatch, status]);

//   // Load next 10 users
//   const loadMoreUsers = () => {
//     if (
//       status !== 'succeeded' ||
//       loadingMore ||
//       loadingMoreRef.current ||
//       users.length >= total
//     ) {
//       return;
//     }

//     loadingMoreRef.current = true;

//     dispatch(fetchUsers({ skip, limit })).finally(() => {
//       loadingMoreRef.current = false;
//     });
//   };

//   // Retry initial API request
//   const handleRetry = () => {
//     dispatch(fetchUsers({ skip: 0, limit: 10 }));
//   };

//   // Initial loading screen
//   if (status === 'loading' && users.length === 0) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" />
//         <Text style={styles.message}>Loading users...</Text>
//       </View>
//     );
//   }

//   // Initial API error screen
//   if (status === 'failed' && users.length === 0) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.errorText}>
//           {error || 'Unable to fetch users'}
//         </Text>

//         <Pressable
//           style={styles.retryButton}
//           onPress={handleRetry}
//         >
//           <Text style={styles.buttonText}>Retry</Text>
//         </Pressable>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>
//         Users Directory
//       </Text>

//       <Text style={styles.count}>
//         Showing {users.length} of {total} users
//       </Text>

//       <FlatList
//         data={users}
//         keyExtractor={item => item.id.toString()}

//         renderItem={({ item }) => (
//           <View style={styles.userCard}>
//             <Text style={styles.name}>
//               {item.firstName} {item.lastName}
//             </Text>

//             <Text style={styles.detail}>
//               {item.email}
//             </Text>

//             <Text style={styles.detail}>
//               {item.phone}
//             </Text>
//           </View>
//         )}

//         // Load next page when reaching the end
//         onEndReached={loadMoreUsers}
//         onEndReachedThreshold={0.5}

//         // Empty list message
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>
//             No users found.
//           </Text>
//         }

//         // Pagination loading and error
//         ListFooterComponent={
//           <View style={styles.footer}>
//             {loadingMore ? (
//               <View style={styles.loadingMore}>
//                 <ActivityIndicator size="small" />

//                 <Text style={styles.footerText}>
//                   Loading more users...
//                 </Text>
//               </View>
//             ) : error && users.length > 0 && users.length < total ? (
//               <Pressable
//                 style={styles.retryButton}
//                 onPress={loadMoreUsers}
//               >
//                 <Text style={styles.buttonText}>
//                   Retry loading more
//                 </Text>
//               </Pressable>
//             ) : users.length >= total && total > 0 ? (
//               <Text style={styles.footerText}>
//                 No more users
//               </Text>
//             ) : (
//               <View />
//             )}
//           </View>
//         }

//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 15,
//     backgroundColor: '#FFFFFF',
//   },

//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },

//   heading: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 5,
//     color: '#222222',
//   },

//   count: {
//     fontSize: 14,
//     color: '#777777',
//     marginBottom: 15,
//   },

//   userCard: {
//     padding: 15,
//     marginBottom: 10,
//     backgroundColor: '#EEEEEE',
//     borderRadius: 8,
//   },

//   name: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#222222',
//     marginBottom: 5,
//   },

//   detail: {
//     fontSize: 14,
//     color: '#444444',
//     marginTop: 3,
//   },

//   message: {
//     marginTop: 10,
//     fontSize: 15,
//     color: '#222222',
//   },

//   errorText: {
//     color: '#B00020',
//     marginBottom: 15,
//     textAlign: 'center',
//   },

//   retryButton: {
//     backgroundColor: '#2196F3',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10,
//   },

//   buttonText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//   },

//   emptyText: {
//     textAlign: 'center',
//     marginTop: 30,
//     color: '#777777',
//   },

//   footer: {
//     padding: 18,
//     alignItems: 'center',
//   },

//   loadingMore: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },

//   footerText: {
//     color: '#777777',
//     fontSize: 14,
//   },
// });

// export default UsersScreen;
