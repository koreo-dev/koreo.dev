---
id: cel-expressions
title: CEL Expressions
sidebar_position: 7
---
# CEL Expressions

The **Common Expression Language (CEL)** is a powerful, efficient, and portable expression language used for policy evaluation, rule enforcement, and data validation. It provides a rich set of features for working with primitive types, collections, and custom functions.

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

### Arithmetic Operators
| Operator | Description     | Example    |
|----------|---------------|-----------|
| `+`      | Addition       | `a + b`   |
| `-`      | Subtraction    | `a - b`   |
| `*`      | Multiplication | `a * b`   |
| `/`      | Division       | `a / b`   |
| `%`      | Modulo         | `a % b`   |

### Comparison Operators
| Operator  | Description             | Example      |
|-----------|-------------------------|-------------|
| `==`      | Equals                   | `a == b`    |
| `!=`      | Not equals                | `a != b`    |
| `<`       | Less than                 | `a < b`     |
| `<=`      | Less than or equal        | `a <= b`    |
| `>`       | Greater than              | `a > b`     |
| `>=`      | Greater than or equal     | `a >= b`    |

### **Logical Operators
| Operator | Description | Example  |
|----------|-------------|----------|
| `&&`     | Logical AND | `a && b` |
| `\|\|`   | Logical OR  | `a \|\| b`|
| `!`      | Logical NOT | `!a`     |

### Membership Operators
| Operator  | Description                              | Example         |
|-----------|------------------------------------------|----------------|
| `in`      | Checks if value exists in a list/map    | `"x" in list`  |

---

## Functions

### String Functions
| Function                     | Description                                      | Example |
|------------------------------|--------------------------------------------------|---------|
| `string.contains(substring)` | Checks if string contains a substring            | `"hello".contains("he")` |
| `string.startsWith(prefix)`  | Checks if string starts with a given prefix      | `"hello".startsWith("he")` |
| `string.endsWith(suffix)`    | Checks if string ends with a given suffix        | `"hello".endsWith("lo")` |
| `string.matches(regex)`      | Checks if string matches regex                   | `"hello".matches("[a-z]+")` |
| `string.toLower()`           | Converts string to lowercase                     | `"HELLO".toLower()` |
| `string.toUpper()`           | Converts string to uppercase                     | `"hello".toUpper()` |

### List Functions
| Function            | Description                           | Example |
|--------------------|-----------------------------------|---------|
| `list.size()`     | Returns the number of elements   | `[1, 2, 3].size()` |
| `list.contains(x)` | Checks if list contains `x`     | `[1, 2, 3].contains(2)` |
| `list.map(f)`     | Applies function `f` to elements | `[1, 2, 3].map(x, x * 2)` |

### Map (Dictionary) Functions
| Function         | Description                          | Example |
|-----------------|--------------------------------------|---------|
| `map.keys()`    | Returns a list of all keys in map   | `{"a": 1, "b": 2}.keys()` |
| `map.values()`  | Returns a list of all values        | `{"a": 1, "b": 2}.values()` |
| `map.size()`    | Returns the number of key-value pairs | `{"a": 1, "b": 2}.size()` |

### Macros

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

### Extensions

CEL is designed to be extended, below are some additions we have made to further support our own use-cases.

| **Function Name**                  | **Description**                                                                                                                                                                                  | **Example Usage**                     |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| `self_ref(map)`                    | Extracts a self-reference from a resource. Returns a dictionary containing `apiVersion`, `kind`, `metadata.name`, and `metadata.namespace`. Returns an error if any of these fields are missing. | ```self_ref(resource) ```             |
| `to_ref(map)`                      | Builds a reference object from a source resource. If `external` is present, adds the `external` field to the reference. If `name` is not provided, returns an error.                             | ```to_ref(source) ```                 |
| `group_ref(map)`                   | Constructs a group reference from a source resource. It first tries to extract `apiGroup` and falls back to `apiVersion`. Returns an error if `external` or `name` are missing.                  | ```group_ref(source) ```              |
| `kindless_ref(map)`                | Builds a kindless reference from a source resource. If `external` is present, it adds the `external` field. Returns an error if `name` is missing.                                               | ```kindless_ref(source) ```           |
| `config_connect_ready(map)`        | Checks if a resource's `status.conditions` contains a `Ready` condition with a status of `True` and a reason of `UpToDate`. Returns `True` if ready, otherwise `False`.                          | ```config_connect_ready(resource) ``` |
| `overlay(map)`                     | Applies an overlay to a resource by performing a deep merge between the resource and overlay. Returns the updated resource.                                                                      | ```overlay(resource, overlay) ```     |
| `flatten(list)`                    | Flattens a list of nested lists into a single list. Returns an error if the resource is invalid or empty.                                                                                        | ```flatten(resource) ```              |
| `lower(string)`                    | Converts a string to lowercase.                                                                                                                                                                  | ```lower(string) ```                  |
| `strip(string)`                    | Strips characters from both ends of a string.                                                                                                                                                    | ```strip(string, on) ```              |
| `rstrip(string)`                   | Strips characters from the right end of a string.                                                                                                                                                | ```rstrip(string, on) ```             |
| `split(string, string)`            | Splits a string into a list based on a separator. Returns an error if the separator is empty.                                                                                                    | ```split(string, on) ```              |
| `split_first(string, string)`      | Splits a string and returns the first part before the separator. Returns an error if the separator is empty.                                                                                     | ```split_first(string, on) ```        |
| `split_last(string, string)`       | Splits a string and returns the last part after the separator. Returns an error if the separator is empty.                                                                                       | ```split_last(string, on) ```         |
| `split_index(string, string, int)` | Splits a string and returns the part at the specified index. Returns an error if the index is out of bounds or separator is empty.                                                               | ```split_index(string, on, index) ``` |
| `to_json(list \| map \| string)`   | Converts a value to a JSON-encoded string. Returns an error if JSON encoding fails.                                                                                          | ```to_json(value) ``` |
| `from_json(string)`                | Decodes a JSON string into a CEL value. Returns an error if JSON decoding fails.                                                                                                                 | ```from_json(value) ```               |
| `b64encode(string)`                | Encodes a value into a Base64 string. Returns an error if Base64 encoding fails.                                                                                                                 | ```b64encode(value) ```               |
| `b64decode(string)`                | Decodes a Base64-encoded string into its original value. Returns an error if Base64 decoding fails.                                                                                              | ```b64decode(value) ```               |

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
