import { createAtom, reaction } from "mobx"
import type { DefaultError, MutationObserverOptions } from "@tanstack/query-core";
import { MutationObserver, QueryClient } from "@tanstack/query-core";

export class MobxMutation<
    TData = unknown,
    TError = DefaultError,
    TVariables = void,
    TContext = unknown,
> {
    private atom = createAtom(
        "MobxMutation",
        () => this.startTracking(),
        () => this.stopTracking()
    );

    private mutationObserver: MutationObserver<TData, TError, TVariables, TContext>;
    private unsubscribe: () => void = () => {};
    private getOptions: () => MutationObserverOptions<TData, TError, TVariables, TContext>;
    private queryClient: QueryClient;

    constructor(
        getOptions: () => MutationObserverOptions<TData, TError, TVariables, TContext>,
        queryClient: QueryClient
    ) {
        this.getOptions = getOptions;
        this.queryClient = queryClient;
        this.mutationObserver = new MutationObserver(
            queryClient,
            queryClient.defaultMutationOptions(this.getOptions())
        );
    }

    get result() {
        this.atom.reportObserved();
        this.mutationObserver.setOptions(this.defaultMutationOptions);
        return this.mutationObserver.getCurrentResult();
    }

    get data(): TData | undefined {
        return this.result.data;
    }

    get error(): TError | null {
        return this.result.error;
    }

    get status(): string {
        return this.result.status;
    }

    mutate = (variables: TVariables) => {
        return this.mutationObserver.mutate(variables);
    };

    private startTracking() {
        const unsubscribeReaction = reaction(
            () => this.defaultMutationOptions,
            () => {
                this.mutationObserver.setOptions(this.defaultMutationOptions);
            }
        );

        const unsubscribeObserver = this.mutationObserver.subscribe(() => {
            this.atom.reportChanged();
        });

        this.unsubscribe = () => {
            unsubscribeReaction();
            unsubscribeObserver();
        };
    }

    private stopTracking() {
        this.unsubscribe();
    }

    private get defaultMutationOptions() {
        return this.queryClient.defaultMutationOptions(this.getOptions());
    }
}