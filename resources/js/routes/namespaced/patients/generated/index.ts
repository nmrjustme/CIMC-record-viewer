import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\patientsController::method6wlEVGKMCFXNZkiW
 * @see app/Http/Controllers/patientsController.php:28
 * @route '/viewer/{hrn}/folder'
 */
export const method6wlEVGKMCFXNZkiW = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: method6wlEVGKMCFXNZkiW.url(args, options),
    method: 'get',
})

method6wlEVGKMCFXNZkiW.definition = {
    methods: ["get","head"],
    url: '/viewer/{hrn}/folder',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\patientsController::method6wlEVGKMCFXNZkiW
 * @see app/Http/Controllers/patientsController.php:28
 * @route '/viewer/{hrn}/folder'
 */
method6wlEVGKMCFXNZkiW.url = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return method6wlEVGKMCFXNZkiW.definition.url
            .replace('{hrn}', parsedArgs.hrn.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\patientsController::method6wlEVGKMCFXNZkiW
 * @see app/Http/Controllers/patientsController.php:28
 * @route '/viewer/{hrn}/folder'
 */
method6wlEVGKMCFXNZkiW.get = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: method6wlEVGKMCFXNZkiW.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\patientsController::method6wlEVGKMCFXNZkiW
 * @see app/Http/Controllers/patientsController.php:28
 * @route '/viewer/{hrn}/folder'
 */
method6wlEVGKMCFXNZkiW.head = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: method6wlEVGKMCFXNZkiW.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\patientsController::method6wlEVGKMCFXNZkiW
 * @see app/Http/Controllers/patientsController.php:28
 * @route '/viewer/{hrn}/folder'
 */
    const method6wlEVGKMCFXNZkiWForm = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: method6wlEVGKMCFXNZkiW.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\patientsController::method6wlEVGKMCFXNZkiW
 * @see app/Http/Controllers/patientsController.php:28
 * @route '/viewer/{hrn}/folder'
 */
        method6wlEVGKMCFXNZkiWForm.get = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: method6wlEVGKMCFXNZkiW.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\patientsController::method6wlEVGKMCFXNZkiW
 * @see app/Http/Controllers/patientsController.php:28
 * @route '/viewer/{hrn}/folder'
 */
        method6wlEVGKMCFXNZkiWForm.head = (args: { hrn: string | number } | [hrn: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: method6wlEVGKMCFXNZkiW.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    method6wlEVGKMCFXNZkiW.form = method6wlEVGKMCFXNZkiWForm
const generated = {
    6wlEVGKMCFXNZkiW: Object.assign(method6wlEVGKMCFXNZkiW, method6wlEVGKMCFXNZkiW),
}

export default generated