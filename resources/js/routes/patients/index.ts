import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:13
 * @route '/viewer/record-finder'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/viewer/record-finder',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:13
 * @route '/viewer/record-finder'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:13
 * @route '/viewer/record-finder'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:13
 * @route '/viewer/record-finder'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:13
 * @route '/viewer/record-finder'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:13
 * @route '/viewer/record-finder'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:13
 * @route '/viewer/record-finder'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:35
 * @route '/viewer/{hrn}/folder'
 */
export const folder = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: folder.url(args, options),
    method: 'get',
})

folder.definition = {
    methods: ["get","head"],
    url: '/viewer/{hrn}/folder',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:35
 * @route '/viewer/{hrn}/folder'
 */
folder.url = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { hrn: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    hrn: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        hrn: args.hrn,
                }

    return folder.definition.url
            .replace('{hrn}', parsedArgs.hrn.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:35
 * @route '/viewer/{hrn}/folder'
 */
folder.get = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: folder.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:35
 * @route '/viewer/{hrn}/folder'
 */
folder.head = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: folder.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:35
 * @route '/viewer/{hrn}/folder'
 */
    const folderForm = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: folder.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:35
 * @route '/viewer/{hrn}/folder'
 */
        folderForm.get = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: folder.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:35
 * @route '/viewer/{hrn}/folder'
 */
        folderForm.head = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: folder.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    folder.form = folderForm
/**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:64
 * @route '/patients/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/patients/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:64
 * @route '/patients/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:64
 * @route '/patients/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:64
 * @route '/patients/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:64
 * @route '/patients/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:64
 * @route '/patients/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:64
 * @route '/patients/create'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\patientsController::store
 * @see app/Http/Controllers/patientsController.php:77
 * @route '/patients'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/patients',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\patientsController::store
 * @see app/Http/Controllers/patientsController.php:77
 * @route '/patients'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::store
 * @see app/Http/Controllers/patientsController.php:77
 * @route '/patients'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\patientsController::store
 * @see app/Http/Controllers/patientsController.php:77
 * @route '/patients'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\patientsController::store
 * @see app/Http/Controllers/patientsController.php:77
 * @route '/patients'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
const patients = {
    index: Object.assign(index, index),
folder: Object.assign(folder, folder),
create: Object.assign(create, create),
store: Object.assign(store, store),
}

export default patients