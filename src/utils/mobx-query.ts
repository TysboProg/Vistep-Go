import { createAtom, reaction, } from "mobx"
import {type DefaultError, type QueryObserverOptions, type QueryKey} from "@tanstack/query-core"
import { QueryObserver, QueryClient } from "@tanstack/query-core";

export class MobxQuery<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
> {
    private atom = createAtom(
        "MobxQuery",
        () => this.startTracking(),
        () => this.stopTracking()
    )

    private queryObserver: QueryObserver<TQueryFnData, TError, TData, TQueryData, TQueryKey>;
    private unsubscribe: () => void = () => {};
    private getOptions: () => QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>
    private queryClient: QueryClient

    constructor(
        getOptions: () => QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
        queryClient: QueryClient
    ) {
        this.getOptions = getOptions;
        this.queryClient = queryClient;
        this.queryObserver = new QueryObserver(
            queryClient,
            queryClient.defaultMutationOptions(this.getOptions())
        );
    }

    get result() {
        this.atom.reportObserved()
        this.queryObserver.setOptions(this.defaultQueryOptions)
        return this.queryObserver.getOptimisticResult(this.defaultQueryOptions)
    }

    get data(): TData {
        const data = this.result.data;
        if (!data) {
            throw this.queryObserver.fetchOptimistic(this.defaultQueryOptions)
        }
        return data
    }

    private startTracking() {
        const unsubscribeReaction = reaction(
            () => this.defaultQueryOptions,
            () => {
                this.queryObserver.setOptions(this.defaultQueryOptions)
            }
        )
        const unsubscribeObserver = this.queryObserver.subscribe(() => {
            this.atom.reportChanged();
        })

        this.unsubscribe = () => {
            unsubscribeReaction();
            unsubscribeObserver();
        }
    }
    private stopTracking() {
        this.unsubscribe();
    }

    private get defaultQueryOptions() {
        return this.queryClient.defaultQueryOptions(this.getOptions())
    }
}