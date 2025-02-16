import Decimal from 'decimal.js';
import contains from './contains';

export function add(a, b) {
  return new Decimal(a).add(new Decimal(b)).toNumber();
}

export function sub(a, b) {
  return new Decimal(a).sub(new Decimal(b)).toNumber();
}

export function mul(a, b) {
  return new Decimal(a).mul(new Decimal(b)).toNumber();
}

export function div(a, b) {
  return new Decimal(a).div(new Decimal(b)).toNumber();
}

export function mod(a, b) {
  return new Decimal(a).mod(new Decimal(b)).toNumber();
}

export function concat(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.concat(b);
  }
  return '' + a + b;
}

export function equal(a, b) {
  return a === b;
}

export function notEqual(a, b) {
  return a !== b;
}

export function greaterThan(a, b) {
  return new Decimal(a).greaterThan(new Decimal(b));
}

export function lessThan(a, b) {
  return new Decimal(a).lessThan(new Decimal(b));
}

export function greaterThanEqual(a, b) {
  return new Decimal(a).greaterThanOrEqualTo(new Decimal(b));
}

export function lessThanEqual(a, b) {
  return new Decimal(a).lessThanOrEqualTo(new Decimal(b));
}

export function andOperator(a, b) {
  return Boolean(a && b);
}

export function orOperator(a, b) {
  return Boolean(a || b);
}

export function inOperator(a, b) {
  return contains(b, a);
}

export function sinh(a) {
  return new Decimal(a).sinh().toNumber();
}

export function cosh(a) {
  return new Decimal(a).cosh().toNumber();
}

export function tanh(a) {
  if (a === Infinity) return 1;
  if (a === -Infinity) return -1;
  return new Decimal(a).tanh().toNumber();
}

export function asinh(a) {
  if (a === -Infinity) return a;
  return new Decimal(a).asinh().toNumber();
}

export function acosh(a) {
  return new Decimal(a).acosh().toNumber();
}

export function atanh(a) {
  return new Decimal(a).atanh().toNumber();
}

export function log10(a) {
  return new Decimal(a).log(10).toNumber();
}

export function neg(a) {
  return new Decimal(a).mul(-1).toNumber();
}

export function not(a) {
  return !a;
}

export function trunc(a) {
  return new Decimal(a).trunc().toNumber();
}

export function random(a) {
  return new Decimal(Math.random() * (a || 1)).toNumber();
}

export function factorial(a) { // a!
  return gamma(a + 1);
}

function isInteger(value) {
  return isFinite(value) && (value === Math.round(value));
}

var GAMMA_G = 4.7421875;
var GAMMA_P = [
  0.99999999999999709182,
  57.156235665862923517, -59.597960355475491248,
  14.136097974741747174, -0.49191381609762019978,
  0.33994649984811888699e-4,
  0.46523628927048575665e-4, -0.98374475304879564677e-4,
  0.15808870322491248884e-3, -0.21026444172410488319e-3,
  0.21743961811521264320e-3, -0.16431810653676389022e-3,
  0.84418223983852743293e-4, -0.26190838401581408670e-4,
  0.36899182659531622704e-5
];

export function gamma(n) {
  var t, x;

  if (isInteger(n)) {
    if (n <= 0) {
      return isFinite(n) ? Infinity : NaN;
    }

    if (n > 171) {
      return Infinity; // Will overflow
    }

    var value = n - 2;
    var res = n - 1;
    while (value > 1) {
      res *= value;
      value--;
    }

    if (res === 0) {
      res = 1; // 0! is per definition 1
    }

    return res;
  }

  if (n < 0.5) {
    return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));
  }

  if (n >= 171.35) {
    return Infinity; // will overflow
  }

  if (n > 85.0) { // Extended Stirling Approx
    var twoN = n * n;
    var threeN = twoN * n;
    var fourN = threeN * n;
    var fiveN = fourN * n;
    return Math.sqrt(2 * Math.PI / n) * Math.pow((n / Math.E), n) *
      (1 + (1 / (12 * n)) + (1 / (288 * twoN)) - (139 / (51840 * threeN)) -
      (571 / (2488320 * fourN)) + (163879 / (209018880 * fiveN)) +
      (5246819 / (75246796800 * fiveN * n)));
  }

  --n;
  x = GAMMA_P[0];
  for (var i = 1; i < GAMMA_P.length; ++i) {
    x += GAMMA_P[i] / (n + i);
  }

  t = n + GAMMA_G + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
}



export function stringOrArrayLength(s) {
  if (Array.isArray(s)) {
    return s.length;
  }
  return String(s).length;
}

export function hypot(...args) {
  let sum = new Decimal(0);
  let larg = new Decimal(0);
  
  for (const arg of args) {
    const absArg = new Decimal(arg).abs();
    let div;
    
    if (larg.lt(absArg)) {
      div = larg.div(absArg);
      sum = sum.times(div.times(div)).plus(1);
      larg = absArg;
    } else if (!absArg.isZero()) {
      div = absArg.div(larg);
      sum = sum.plus(div.times(div));
    } else {
      sum = sum.plus(absArg);
    }
  }
  
  return larg.eq(Infinity) ? Infinity : larg.times(sum.sqrt());
}

export function condition(cond, yep, nope) {
  return cond ? yep : nope;
}

/**
* Decimal adjustment of a number.
* From @escopecz.
*
* @param {Number} value The number.
* @param {Integer} exp  The exponent (the 10 logarithm of the adjustment base).
* @return {Number} The adjusted value.
*/
export function roundTo(value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math.round(value);
  }
  value = +value;
  exp = -(+exp);
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

export function setVar(name, value, variables) {
  if (variables) variables[name] = value;
  return value;
}

export function arrayIndex(array, index) {
  return array[index | 0];
}

export function max(array) {
  if (arguments.length === 1 && Array.isArray(array)) {
    return Math.max.apply(Math, array);
  } else {
    return Math.max.apply(Math, arguments);
  }
}

export function min(array) {
  if (arguments.length === 1 && Array.isArray(array)) {
    return Math.min.apply(Math, array);
  } else {
    return Math.min.apply(Math, arguments);
  }
}

export function arrayMap(f, a) {
  if (typeof f !== 'function') {
    throw new Error('First argument to map is not a function');
  }
  if (!Array.isArray(a)) {
    throw new Error('Second argument to map is not an array');
  }
  return a.map(function (x, i) {
    return f(x, i);
  });
}

export function arrayFold(f, init, a) {
  if (typeof f !== 'function') {
    throw new Error('First argument to fold is not a function');
  }
  if (!Array.isArray(a)) {
    throw new Error('Second argument to fold is not an array');
  }
  return a.reduce(function (acc, x, i) {
    return f(acc, x, i);
  }, init);
}

export function arrayFilter(f, a) {
  if (typeof f !== 'function') {
    throw new Error('First argument to filter is not a function');
  }
  if (!Array.isArray(a)) {
    throw new Error('Second argument to filter is not an array');
  }
  return a.filter(function (x, i) {
    return f(x, i);
  });
}

export function stringOrArrayIndexOf(target, s) {
  if (!(Array.isArray(s) || typeof s === 'string')) {
    throw new Error('Second argument to indexOf is not a string or array');
  }

  return s.indexOf(target);
}

export function arrayJoin(sep, a) {
  if (!Array.isArray(a)) {
    throw new Error('Second argument to join is not an array');
  }

  return a.join(sep);
}

export function sign(x) {
  return ((x > 0) - (x < 0)) || +x;
}

var ONE_THIRD = 1/3;
export function cbrt(x) {
  return x < 0 ? -Math.pow(-x, ONE_THIRD) : Math.pow(x, ONE_THIRD);
}

export function expm1(x) {
  return Math.exp(x) - 1;
}

export function log1p(x) {
  return Math.log(1 + x);
}

export function log2(x) {
  return Math.log(x) / Math.LN2;
}

export function sum(array) {
  if (!Array.isArray(array)) {
    throw new Error('Sum argument is not an array');
  }

  return array.reduce(function (total, value) {
    return total + Number(value);
  }, 0);
}
