import { TEOF } from './token';
import { TokenStream } from './token-stream';
import { ParserState } from './parser-state';
import { Expression } from './expression';
import {
  add,
  sub,
  mul,
  div,
  mod,
  concat,
  equal,
  notEqual,
  greaterThan,
  lessThan,
  greaterThanEqual,
  lessThanEqual,
  andOperator,
  orOperator,
  inOperator,
  sinh,
  cosh,
  tanh,
  asinh,
  acosh,
  atanh,
  log10,
  neg,
  not,
  trunc,
  random,
  factorial,
  gamma,
  stringOrArrayLength,
  hypot,
  condition,
  roundTo,
  setVar,
  arrayIndex,
  max,
  min,
  arrayMap
} from './functions';

export function Parser(options) {
  this.options = options || {};
  this.unaryOps = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sinh: Math.sinh || sinh,
    cosh: Math.cosh || cosh,
    tanh: Math.tanh || tanh,
    asinh: Math.asinh || asinh,
    acosh: Math.acosh || acosh,
    atanh: Math.atanh || atanh,
    sqrt: Math.sqrt,
    log: Math.log,
    ln: Math.log,
    lg: Math.log10 || log10,
    log10: Math.log10 || log10,
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    trunc: Math.trunc || trunc,
    '-': neg,
    '+': Number,
    exp: Math.exp,
    not: not,
    length: stringOrArrayLength,
    '!': factorial
  };

  this.binaryOps = {
    '+': add,
    '-': sub,
    '*': mul,
    '/': div,
    '%': mod,
    '^': Math.pow,
    '||': concat,
    '==': equal,
    '!=': notEqual,
    '>': greaterThan,
    '<': lessThan,
    '>=': greaterThanEqual,
    '<=': lessThanEqual,
    and: andOperator,
    or: orOperator,
    'in': inOperator,
    '=': setVar,
    '[': arrayIndex
  };

  this.ternaryOps = {
    '?': condition
  };

  this.functions = {
    random: random,
    fac: factorial,
    min: min,
    max: max,
    hypot: Math.hypot || hypot,
    pyt: Math.hypot || hypot, // backward compat
    pow: Math.pow,
    atan2: Math.atan2,
    gamma: gamma,
    roundTo: roundTo,
    map: arrayMap
  };

  this.consts = {
    E: Math.E,
    PI: Math.PI,
    'true': true,
    'false': false
  };
}

Parser.prototype.parse = function (expr) {
  var instr = [];
  var parserState = new ParserState(
    this,
    new TokenStream(this, expr),
    { allowMemberAccess: this.options.allowMemberAccess }
  );

  parserState.parseExpression(instr);
  parserState.expect(TEOF, 'EOF');

  return new Expression(instr, this);
};

Parser.prototype.evaluate = function (expr, variables) {
  return this.parse(expr).evaluate(variables);
};

var sharedParser = new Parser();

Parser.parse = function (expr) {
  return sharedParser.parse(expr);
};

Parser.evaluate = function (expr, variables) {
  return sharedParser.parse(expr).evaluate(variables);
};

var optionNameMap = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
  '%': 'remainder',
  '^': 'power',
  '!': 'factorial',
  '<': 'comparison',
  '>': 'comparison',
  '<=': 'comparison',
  '>=': 'comparison',
  '==': 'comparison',
  '!=': 'comparison',
  '||': 'concatenate',
  'and': 'logical',
  'or': 'logical',
  'not': 'logical',
  '?': 'conditional',
  ':': 'conditional',
  '=': 'assignment',
  '[': 'array',
  '()=': 'fndef'
};

function getOptionName(op) {
  return optionNameMap.hasOwnProperty(op) ? optionNameMap[op] : op;
}

Parser.prototype.isOperatorEnabled = function (op) {
  var optionName = getOptionName(op);
  var operators = this.options.operators || {};

  return !(optionName in operators) || !!operators[optionName];
};
