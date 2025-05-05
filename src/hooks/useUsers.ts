import { useQueryClient } from "@tanstack/vue-query";
import { MobxVueQuery } from "@/utils/mobx-vue-query";
import { MobxMutationQuery } from "@/utils/mobx-mutation-query"
import { UsersService } from "@/service/UsersService";
import type { IUsers } from "@/types/users.interface";

export function useUsers() {
    const queryClient = useQueryClient();

    const getUsersQuery = new MobxVueQuery(
        () => ({
            queryKey: ['users'],
            queryFn: () => UsersService.getUsers(),
        }),
        queryClient
    );

    const getUserByIdQuery = (id: number) => new MobxVueQuery(
            () => ({
                queryKey: ['user', id],
                queryFn: () => UsersService.getUserById(id),
            }),
            queryClient
        );

    const createUserMutation = new MobxMutationQuery(
        () => ({
            mutationFn: (user: IUsers) => UsersService.createUser(user),
        }),
        queryClient
    );

    const updateUserMutation = new MobxMutationQuery(
        () => ({
            mutationFn: ({ id, updateUser }: { id: number; updateUser: Partial<IUsers> }) =>
                UsersService.updateUser(id, updateUser),
        }),
        queryClient
    );

    const deleteUserMutation = new MobxMutationQuery(
        () => ({
            mutationFn: (id: number) => UsersService.deleteUser(id),
        }),
        queryClient
    );

    return {
        getUsersQuery,
        getUserByIdQuery,
        createUserMutation,
        updateUserMutation,
        deleteUserMutation,
    };
}