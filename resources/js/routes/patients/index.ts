import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:27
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
 * @see app/Http/Controllers/patientsController.php:27
 * @route '/viewer/record-finder'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:27
 * @route '/viewer/record-finder'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:27
 * @route '/viewer/record-finder'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:27
 * @route '/viewer/record-finder'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:27
 * @route '/viewer/record-finder'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:27
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
 * @see app/Http/Controllers/patientsController.php:72
 * @route '/viewer/folder'
 */
export const folder = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: folder.url(options),
    method: 'get',
})

folder.definition = {
    methods: ["get","head"],
    url: '/viewer/folder',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:72
 * @route '/viewer/folder'
 */
folder.url = (options?: RouteQueryOptions) => {
    return folder.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:72
 * @route '/viewer/folder'
 */
folder.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: folder.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:72
 * @route '/viewer/folder'
 */
folder.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: folder.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:72
 * @route '/viewer/folder'
 */
    const folderForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: folder.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:72
 * @route '/viewer/folder'
 */
        folderForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: folder.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:72
 * @route '/viewer/folder'
 */
        folderForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: folder.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    folder.form = folderForm
/**
* @see \App\Http\Controllers\patientsController::addHrn
 * @see app/Http/Controllers/patientsController.php:209
 * @route '/patients/add-hrn'
 */
export const addHrn = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addHrn.url(options),
    method: 'post',
})

addHrn.definition = {
    methods: ["post"],
    url: '/patients/add-hrn',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\patientsController::addHrn
 * @see app/Http/Controllers/patientsController.php:209
 * @route '/patients/add-hrn'
 */
addHrn.url = (options?: RouteQueryOptions) => {
    return addHrn.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::addHrn
 * @see app/Http/Controllers/patientsController.php:209
 * @route '/patients/add-hrn'
 */
addHrn.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addHrn.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\patientsController::addHrn
 * @see app/Http/Controllers/patientsController.php:209
 * @route '/patients/add-hrn'
 */
    const addHrnForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: addHrn.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\patientsController::addHrn
 * @see app/Http/Controllers/patientsController.php:209
 * @route '/patients/add-hrn'
 */
        addHrnForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: addHrn.url(options),
            method: 'post',
        })
    
    addHrn.form = addHrnForm
/**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:116
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
 * @see app/Http/Controllers/patientsController.php:116
 * @route '/patients/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:116
 * @route '/patients/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:116
 * @route '/patients/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:116
 * @route '/patients/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:116
 * @route '/patients/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:116
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
 * @see app/Http/Controllers/patientsController.php:143
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
 * @see app/Http/Controllers/patientsController.php:143
 * @route '/patients'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::store
 * @see app/Http/Controllers/patientsController.php:143
 * @route '/patients'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\patientsController::store
 * @see app/Http/Controllers/patientsController.php:143
 * @route '/patients'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\patientsController::store
 * @see app/Http/Controllers/patientsController.php:143
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
addHrn: Object.assign(addHrn, addHrn),
create: Object.assign(create, create),
store: Object.assign(store, store),
}

export default patients