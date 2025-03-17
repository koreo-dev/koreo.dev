---
id: cel-support
title: CEL Support
sidebar_position: 7
---
# Common Expression Language (CEL) Specification

The **Common Expression Language (CEL)** is a powerful, efficient, and portable expression language used for policy evaluation, rule enforcement, and data validation. It provides a rich set of features for working with primitive types, collections, and custom functions.

## Table of Contents

1. [Overview](#overview)
2. [Data Types](#data-types)
3. [Operators](#operators)
4. [Functions](#functions)
5. [Variables and Attributes](#variables-and-attributes)
6. [Control Flow](#control-flow)
7. [Examples](#examples)
8. [References](#references)

---

## Overview

CEL is designed to provide a safe, deterministic, and efficient way to evaluate expressions in different environments, such as security policies, rule engines, and configuration validation.

Key features:
- **Strongly typed expressions**
- **Deterministic execution**
- **Minimal runtime footprint**
- **Custom function extensions**

---

## Data Types

CEL supports various data types:

### **Primitive Types**
| Type      | Description                           | Example |
|-----------|---------------------------------------|---------|
| `bool`    | Boolean values `true` or `false`     | `true`  |
| `int`     | 64-bit signed integer                | `42`    |
| `uint`    | 64-bit unsigned integer              | `42u`   |
| `double`  | 64-bit floating-point number         | `3.14`  |
| `string`  | UTF-8 encoded string                 | `"hello"` |
| `bytes`   | Binary data                          | `b"data"` |

### **Composite Types**
| Type       | Description                                       | Example |
|------------|---------------------------------------------------|---------|
| `list<T>`  | Ordered collection of elements                   | `[1, 2, 3]` |
| `map<K, V>`| Key-value dictionary                             | `{"key": "value"}` |
| `null`     | Represents absence of a value                    | `null` |

---

## Operators

### **Arithmetic Operators**
| Operator | Description     | Example    |
|----------|---------------|-----------|
| `+`      | Addition       | `a + b`   |
| `-`      | Subtraction    | `a - b`   |
| `*`      | Multiplication | `a * b`   |
| `/`      | Division       | `a / b`   |
| `%`      | Modulo         | `a % b`   |

### **Comparison Operators**
| Operator  | Description             | Example      |
|-----------|-------------------------|-------------|
| `==`      | Equals                   | `a == b`    |
| `!=`      | Not equals                | `a != b`    |
| `<`       | Less than                 | `a < b`     |
| `<=`      | Less than or equal        | `a <= b`    |
| `>`       | Greater than              | `a > b`     |
| `>=`      | Greater than or equal     | `a >= b`    |

### **Logical Operators**
| Operator | Description | Example  |
|----------|-------------|----------|
| `&&`     | Logical AND | `a && b` |
| `\|\|`   | Logical OR  | `a \|\| b`|
| `!`      | Logical NOT | `!a`     |

### **Membership Operators**
| Operator  | Description                              | Example         |
|-----------|------------------------------------------|----------------|
| `in`      | Checks if value exists in a list/map    | `"x" in list`  |

---

## Functions

### **String Functions**
| Function                     | Description                                      | Example |
|------------------------------|--------------------------------------------------|---------|
| `string.contains(substring)` | Checks if string contains a substring            | `"hello".contains("he")` |
| `string.startsWith(prefix)`  | Checks if string starts with a given prefix      | `"hello".startsWith("he")` |
| `string.endsWith(suffix)`    | Checks if string ends with a given suffix        | `"hello".endsWith("lo")` |
| `string.matches(regex)`      | Checks if string matches regex                   | `"hello".matches("[a-z]+")` |
| `string.toLower()`           | Converts string to lowercase                     | `"HELLO".toLower()` |
| `string.toUpper()`           | Converts string to uppercase                     | `"hello".toUpper()` |

### **List Functions**
| Function            | Description                           | Example |
|--------------------|-----------------------------------|---------|
| `list.size()`     | Returns the number of elements   | `[1, 2, 3].size()` |
| `list.contains(x)` | Checks if list contains `x`     | `[1, 2, 3].contains(2)` |
| `list.map(f)`     | Applies function `f` to elements | `[1, 2, 3].map(x, x * 2)` |

### **Map (Dictionary) Functions**
| Function         | Description                          | Example |
|-----------------|--------------------------------------|---------|
| `map.keys()`    | Returns a list of all keys in map   | `{"a": 1, "b": 2}.keys()` |
| `map.values()`  | Returns a list of all values        | `{"a": 1, "b": 2}.values()` |
| `map.size()`    | Returns the number of key-value pairs | `{"a": 1, "b": 2}.size()` |

## Macros

CEL provides built-in **macros** for reducing boilerplate expressions:

| Macro                          | Description                               | Example                                       |
|--------------------------------|-------------------------------------------|-----------------------------------------------|
| `has(field)`                   | Checks if a field exists                  | `has(resource.owner)`                         |
| `all(list, x, cond)`           | Returns `true` if all elements match a condition | `[1, 2, 3].all(x, x > 0)`                     |
| `exists(list, x, cond)`        | Returns `true` if any element matches a condition | `[1, 2, 3].exists(x, x == 2)`                 |
| `exists_one(list, x, cond)`    | Returns `true` if exactly one element matches a condition | `[1, 2, 3].exists_one(x, x == 2)`             |
| `filter(list, x, cond)`        | Returns a list of elements matching a condition | `[1, 2, 3, 4].filter(x, x > 2)`               |
| `map(list, x, expr)`           | Transforms list elements using an expression | `[1, 2, 3].map(x, x * 2)`                     |
| `reduce(list, acc, x, op_expr)` |  Iterates over list, applying expr to accumulate a value acc (initial accumulator value). | `[1, 2, 3, 4].reduce(0, x, acc + x)` -> `10`  |
---

## Variables and Attributes

CEL supports referencing variables in an expression:

```cel
request.user == "admin"
resource.name.startsWith("prod-")
```

## Control Flow

CEL supports ternary conditional expressions:

```cel
x > 10 ? "large" : "small"
```

There are no loops in CEL, but functions like .map(), .filter(), and .all() provide equivalent functionality.
