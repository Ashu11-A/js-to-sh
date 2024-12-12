import { Method } from '../../class/methods.js'
import type { Expression, PrivateIdentifier } from '../../../node_modules/meriyah/dist/src/estree.js'
import { Colors } from '@loggings/beta'

/**
 * Usado em parseMemberExpression
 *
 * @param {MetaProperty} expression
 * @param {(Expression | PrivateIdentifier)} prop
 * @returns {string}
 */
new Method<'MetaProperty', Expression | PrivateIdentifier>({
  type: 'MetaProperty',
  parser(expression, options) {
    const metaName = options.subprocess(expression.meta.type, expression.meta)
    const propertyName = options.subprocess(expression.property.type, expression.property)
    const property = options.data

    if (property === undefined) throw new Error('[MetaProperty] property is undefined')
    const endPropertyName = options.subprocess(property.type, property)
    
    switch (`${metaName}.${propertyName}.${endPropertyName}`) {
    case 'import.meta.dirname': return '$(dirname "$(realpath "$0")")'
    default: console.debug(Colors('red', `[parseMetaProperty] Not identified: ${metaName}.${propertyName}.${endPropertyName}`))
    }
    return ''
  }
})