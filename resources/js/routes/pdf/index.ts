import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PdfController::createBlank
 * @see app/Http/Controllers/PdfController.php:16
 * @route '/pdf/create-blank'
 */
export const createBlank = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createBlank.url(options),
    method: 'post',
})

createBlank.definition = {
    methods: ["post"],
    url: '/pdf/create-blank',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PdfController::createBlank
 * @see app/Http/Controllers/PdfController.php:16
 * @route '/pdf/create-blank'
 */
createBlank.url = (options?: RouteQueryOptions) => {
    return createBlank.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PdfController::createBlank
 * @see app/Http/Controllers/PdfController.php:16
 * @route '/pdf/create-blank'
 */
createBlank.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createBlank.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PdfController::createBlank
 * @see app/Http/Controllers/PdfController.php:16
 * @route '/pdf/create-blank'
 */
    const createBlankForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: createBlank.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PdfController::createBlank
 * @see app/Http/Controllers/PdfController.php:16
 * @route '/pdf/create-blank'
 */
        createBlankForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: createBlank.url(options),
            method: 'post',
        })
    
    createBlank.form = createBlankForm
const pdf = {
    createBlank: Object.assign(createBlank, createBlank),
}

export default pdf