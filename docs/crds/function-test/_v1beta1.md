<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Required</th>
        </tr>
    </thead>
    <tbody><tr>
      <td><b>apiVersion</b></td>
      <td>string</td>
      <td>koreo.realkinetic.com/v1beta1</td>
      <td>true</td>
      </tr>
      <tr>
      <td><b>kind</b></td>
      <td>string</td>
      <td>FunctionTest</td>
      <td>true</td>
      </tr>
      <tr>
      <td><b><a href="https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.27/#objectmeta-v1-meta">metadata</a></b></td>
      <td>object</td>
      <td>Refer to the Kubernetes API documentation for the fields of the `metadata` field.</td>
      <td>true</td>
      </tr><tr>
        <td><b><a href="#spec">spec</a></b></td>
        <td>object</td>
        <td>
          <br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>status</b></td>
        <td>object</td>
        <td>
          <br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Required</th>
        </tr>
    </thead>
    <tbody><tr>
        <td><b><a href="#specfunctionref">functionRef</a></b></td>
        <td>object</td>
        <td>
          The Function Under Test<br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>currentResource</b></td>
        <td>RawExtension</td>
        <td>
          If specified, the initial resource state in cluster. If
provided it must be a full object definition.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>inputs</b></td>
        <td>object</td>
        <td>
          The base inputs to be provided to the Function Under Test.
If the function requires inputs, this must be specified and
it must contain all required inputs. `inputs` must be a
map, but static values, arrays, and objects are allowed as
values. Within tests, Koreo Expressions are not allowed as
inputs.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#spectestcasesindex">testCases</a></b></td>
        <td>[]object</td>
        <td>
          Test cases to be run sequentially. Each test case runs the
Function Under Test once, using the resulting state (inputs
and current resource) from prior non-variant test case or
the initial values. Each test case must specify exactly one
assertion.
<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.functionRef

The Function Under Test

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Required</th>
        </tr>
    </thead>
    <tbody><tr>
        <td><b>kind</b></td>
        <td>enum</td>
        <td>
          <br/>
          <br/>
            <i>Enum</i>: ResourceFunction, ValueFunction<br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>name</b></td>
        <td>string</td>
        <td>
          <br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.testCases[index]

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Required</th>
        </tr>
    </thead>
    <tbody><tr>
        <td><b>currentResource</b></td>
        <td>RawExtension</td>
        <td>
          Fully *replace* the current resource. If this is a
non-variant test case, this will carry forward to
subsequent test cases. This must be the full object.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>expectDelete</b></td>
        <td>boolean</td>
        <td>
          Assert that a resource deletion was attempted.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#spectestcasesindexexpectoutcome">expectOutcome</a></b></td>
        <td>object</td>
        <td>
          Assert the function's return type.<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>expectResource</b></td>
        <td>RawExtension</td>
        <td>
          Assert that a resource create or patch was attempted
and that the resource exactly matches this
specification.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>expectReturn</b></td>
        <td>object</td>
        <td>
          Assert that no resource modifications were attempted,
and that the function returned this exact object.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>inputOverrides</b></td>
        <td>object</td>
        <td>
          Fully *replace* input values with those provided. If
this is a non-variant test case, these will carry
forward to subsequent test cases. This must be an
object, but the values may be simple values, lists,
or objects. Koreo Expressions are not allowed.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>label</b></td>
        <td>string</td>
        <td>
          An optional descriptive name.<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>overlayResource</b></td>
        <td>object</td>
        <td>
          *Overlay* the specified properties onto the current
resource. If this is a non-variant test case, this
will carry forward to subsequent test cases. This
must be an object, partial updates are allowed. Koreo
Expressions may be used, and have access to
`template` which is the current resource state.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>skip</b></td>
        <td>boolean</td>
        <td>
          Skip running this test case.<br/>
          <br/>
            <i>Default</i>: false<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>variant</b></td>
        <td>boolean</td>
        <td>
          Indicates that state mutations should not be carried
forward. Default is `false`.
<br/>
          <br/>
            <i>Default</i>: false<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.testCases[index].expectOutcome

Assert the function's return type.

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Required</th>
        </tr>
    </thead>
    <tbody><tr>
        <td><b><a href="#spectestcasesindexexpectoutcomedepskip">depSkip</a></b></td>
        <td>object</td>
        <td>
          Assert that a `DepSkip` was returned.<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>ok</b></td>
        <td>object</td>
        <td>
          Assert that no resource modifications were
attempted, and that the function returned
successfully. Makes no assertions about the
return value, if any.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#spectestcasesindexexpectoutcomepermfail">permFail</a></b></td>
        <td>object</td>
        <td>
          Assert that a `PermFail` was returned.<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#spectestcasesindexexpectoutcomeretry">retry</a></b></td>
        <td>object</td>
        <td>
          Assert that a `Retry` was returned, which
indicates either an explictly returned `Retry` or
a resource modification (create, update, or
delete).
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#spectestcasesindexexpectoutcomeskip">skip</a></b></td>
        <td>object</td>
        <td>
          Assert that a `Skip` was returned.<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.testCases[index].expectOutcome.depSkip

Assert that a `DepSkip` was returned.

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Required</th>
        </tr>
    </thead>
    <tbody><tr>
        <td><b>message</b></td>
        <td>string</td>
        <td>
          Assert that the message _contains_ this
value. Case insensitive. Use '' to match any.
<br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.testCases[index].expectOutcome.permFail

Assert that a `PermFail` was returned.

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Required</th>
        </tr>
    </thead>
    <tbody><tr>
        <td><b>message</b></td>
        <td>string</td>
        <td>
          Assert that the message _contains_ this
value. Case insensitive. Use '' to match any.
<br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.testCases[index].expectOutcome.retry

Assert that a `Retry` was returned, which
indicates either an explictly returned `Retry` or
a resource modification (create, update, or
delete).

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Required</th>
        </tr>
    </thead>
    <tbody><tr>
        <td><b>delay</b></td>
        <td>integer</td>
        <td>
          Assert that the delay is exactly this value.
Use 0 to match any.
<br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>message</b></td>
        <td>string</td>
        <td>
          Assert that the message _contains_ this
value. Case insensitive. Use '' to match any.
<br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.testCases[index].expectOutcome.skip

Assert that a `Skip` was returned.

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Required</th>
        </tr>
    </thead>
    <tbody><tr>
        <td><b>message</b></td>
        <td>string</td>
        <td>
          Assert that the message _contains_ this
value. Case insensitive. Use '' to match any.
<br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>
