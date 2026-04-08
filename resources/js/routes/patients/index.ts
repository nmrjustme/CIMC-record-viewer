import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:22
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
 * @see app/Http/Controllers/patientsController.php:22
 * @route '/viewer/record-finder'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:22
 * @route '/viewer/record-finder'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:22
 * @route '/viewer/record-finder'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:22
 * @route '/viewer/record-finder'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:22
 * @route '/viewer/record-finder'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\patientsController::index
 * @see app/Http/Controllers/patientsController.php:22
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
 * @see app/Http/Controllers/patientsController.php:52
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
 * @see app/Http/Controllers/patientsController.php:52
 * @route '/viewer/folder'
 */
folder.url = (options?: RouteQueryOptions) => {
    return folder.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:52
 * @route '/viewer/folder'
 */
folder.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: folder.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:52
 * @route '/viewer/folder'
 */
folder.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: folder.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:52
 * @route '/viewer/folder'
 */
    const folderForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: folder.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:52
 * @route '/viewer/folder'
 */
        folderForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: folder.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\patientsController::folder
 * @see app/Http/Controllers/patientsController.php:52
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
 * @see app/Http/Controllers/patientsController.php:139
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
 * @see app/Http/Controllers/patientsController.php:139
 * @route '/patients/add-hrn'
 */
addHrn.url = (options?: RouteQueryOptions) => {
    return addHrn.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::addHrn
 * @see app/Http/Controllers/patientsController.php:139
 * @route '/patients/add-hrn'
 */
addHrn.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addHrn.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\patientsController::addHrn
 * @see app/Http/Controllers/patientsController.php:139
 * @route '/patients/add-hrn'
 */
    const addHrnForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: addHrn.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\patientsController::addHrn
 * @see app/Http/Controllers/patientsController.php:139
 * @route '/patients/add-hrn'
 */
        addHrnForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: addHrn.url(options),
            method: 'post',
        })
    
    addHrn.form = addHrnForm
/**
* @see \App\Http\Controllers\patientsController::edit
 * @see app/Http/Controllers/patientsController.php:0
 * @route '/patients/{patient}/edit'
 */
export const edit = (args: { patient: string | number } | [patient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/patients/{patient}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\patientsController::edit
 * @see app/Http/Controllers/patientsController.php:0
 * @route '/patients/{patient}/edit'
 */
edit.url = (args: { patient: string | number } | [patient: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { patient: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    patient: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        patient: args.patient,
                }

    return edit.definition.url
            .replace('{patient}', parsedArgs.patient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::edit
 * @see app/Http/Controllers/patientsController.php:0
 * @route '/patients/{patient}/edit'
 */
edit.get = (args: { patient: string | number } | [patient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\patientsController::edit
 * @see app/Http/Controllers/patientsController.php:0
 * @route '/patients/{patient}/edit'
 */
edit.head = (args: { patient: string | number } | [patient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\patientsController::edit
 * @see app/Http/Controllers/patientsController.php:0
 * @route '/patients/{patient}/edit'
 */
    const editForm = (args: { patient: string | number } | [patient: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\patientsController::edit
 * @see app/Http/Controllers/patientsController.php:0
 * @route '/patients/{patient}/edit'
 */
        editForm.get = (args: { patient: string | number } | [patient: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\patientsController::edit
 * @see app/Http/Controllers/patientsController.php:0
 * @route '/patients/{patient}/edit'
 */
        editForm.head = (args: { patient: string | number } | [patient: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\patientsController::update
 * @see app/Http/Controllers/patientsController.php:201
 * @route '/patients/{patient}'
 */
export const update = (args: { patient: string | number } | [patient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/patients/{patient}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\patientsController::update
 * @see app/Http/Controllers/patientsController.php:201
 * @route '/patients/{patient}'
 */
update.url = (args: { patient: string | number } | [patient: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { patient: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    patient: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        patient: args.patient,
                }

    return update.definition.url
            .replace('{patient}', parsedArgs.patient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::update
 * @see app/Http/Controllers/patientsController.php:201
 * @route '/patients/{patient}'
 */
update.put = (args: { patient: string | number } | [patient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\patientsController::update
 * @see app/Http/Controllers/patientsController.php:201
 * @route '/patients/{patient}'
 */
    const updateForm = (args: { patient: string | number } | [patient: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\patientsController::update
 * @see app/Http/Controllers/patientsController.php:201
 * @route '/patients/{patient}'
 */
        updateForm.put = (args: { patient: string | number } | [patient: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:83
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
 * @see app/Http/Controllers/patientsController.php:83
 * @route '/patients/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:83
 * @route '/patients/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:83
 * @route '/patients/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:83
 * @route '/patients/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:83
 * @route '/patients/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\patientsController::create
 * @see app/Http/Controllers/patientsController.php:83
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
 * @see app/Http/Controllers/patientsController.php:101
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
 * @see app/Http/Controllers/patientsController.php:101
 * @route '/patients'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::store
 * @see app/Http/Controllers/patientsController.php:101
 * @route '/patients'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\patientsController::store
 * @see app/Http/Controllers/patientsController.php:101
 * @route '/patients'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\patientsController::store
 * @see app/Http/Controllers/patientsController.php:101
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
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
create: Object.assign(create, create),
store: Object.assign(store, store),
}

export default patients