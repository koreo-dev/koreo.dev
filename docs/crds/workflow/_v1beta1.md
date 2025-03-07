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
      <td>koreo.dev/v1beta1</td>
      <td>true</td>
      </tr>
      <tr>
      <td><b>kind</b></td>
      <td>string</td>
      <td>Workflow</td>
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
        <td>false</td>
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
        <td><b><a href="#specstepsindex">steps</a></b></td>
        <td>[]object</td>
        <td>
          A collection of Functions and Workflows (Logic) which
define this Workflow. The steps may be run as soon as all
of their dependencies have successfully evaluated. Any step
referencing another step must be listed after the step it
references, but evaluation order is not guaranteed.
<br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b><a href="#specconfigstep">configStep</a></b></td>
        <td>object</td>
        <td>
          The entry-point for this Workflow. The triggering-object
will be passed as `inputs.parent`. Though not required, it
is _almost_ always required in order to process a
configuration that provides context to the remaining steps
such as a unique name.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#speccrdref">crdRef</a></b></td>
        <td>object</td>
        <td>
          Optionally specify a Resource that will cause this Workflow
to run. The triggering-object will be passed to the
`configStep` as `inputs.parent`.
<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.steps[index]

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
        <td><b>label</b></td>
        <td>string</td>
        <td>
          The name other steps may use to access this step's
return value (or to express dependence on this step).
This is an identifier it must be alphanumeric +
underscores.
<br/>
          <br/>
            <i>Validations</i>:<li>self.matches("^[[:word:]]+$"): must be alphanumeric + underscores</li>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b><a href="#specstepsindexcondition">condition</a></b></td>
        <td>object</td>
        <td>
          Optional configuration for a Condition that will be
set in the triggering-object's `status.conditions`
list.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specstepsindexforeach">forEach</a></b></td>
        <td>object</td>
        <td>
          Invoke the Logic once per item in `itemIn`, passing
the item within `inputs` as the value of `inputKey`.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>inputs</b></td>
        <td>object</td>
        <td>
          The inputs to be provided to the Logic. `inputs` must
be an object, but static values, arrays, and objects
are allowed. Koreo Expressions are allowed as values
and are indicated with a leading `=`. Note that no
default inputs are provided. The return values from
prior steps, may be referenced using the step's
`label` within the `steps` object. You may pass in
the entire value or extract sub values from prior
steps (`steps.prior_step.sub.value`).
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specstepsindexref">ref</a></b></td>
        <td>object</td>
        <td>
          The Function or Workflow to run as the Logic. No
default `inputs` are provided to the Logic. For
Workflows, `inputs` are passed to the workflow's
`configStep` as `inputs.parent`, which allows
workflows to be invoked as sub-workflows or by their
`crdRef`.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specstepsindexrefswitch">refSwitch</a></b></td>
        <td>object</td>
        <td>
          Dyanmically select the Function or Workflow to run as
the step's Logic. No default `inputs` are provided to
the Logic. For Workflows, `inputs` are passed to the
workflow's `configStep` as `inputs.parent`, which
allows workflows to be invoked as sub-workflows or by
their `crdRef`.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>skipIf</b></td>
        <td>string</td>
        <td>
          Skip running this step if the Koreo Expression
evaluates to `true`.
<br/>
          <br/>
            <i>Validations</i>:<li>self.startsWith('='): must be an expression</li>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>state</b></td>
        <td>object</td>
        <td>
          Defines an object that will be set on the parent's
`status.state`. Useful for surfacing values for
informational or debugging purposes, or to act as a
cache. The `state` objects from all steps are merged,
so if steps shares keys, the values from last step to
run may overwrite earlier values.
<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.steps[index].condition

Optional configuration for a Condition that will be
set in the triggering-object's `status.conditions`
list.

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
        <td><b>name</b></td>
        <td>string</td>
        <td>
          A short, human-meaningful description of what the
step does or manages. It is used within simple
template descriptions to describe the step's
outcome.
<br/>
          <br/>
            <i>Validations</i>:<li>!self.startsWith('='): name may not be an expression</li>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>type</b></td>
        <td>string</td>
        <td>
          The type for a condition acts as its key. If
steps share type, the condition from last run
will be reported on the parent.
<br/>
          <br/>
            <i>Validations</i>:<li>self.matches("^[A-Z][a-zA-Z0-9]+$"): must be PascalCase and contain only alphanumeric chars</li>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.steps[index].forEach

Invoke the Logic once per item in `itemIn`, passing
the item within `inputs` as the value of `inputKey`.

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
        <td><b>inputKey</b></td>
        <td>string</td>
        <td>
          The key within `inputs` that the item will be
passed under.
<br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>itemIn</b></td>
        <td>string</td>
        <td>
          An expression that evaluates to a list of values.
<br/>
          <br/>
            <i>Validations</i>:<li>self.startsWith('='): must be an expression (start with '=').</li>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.steps[index].ref

The Function or Workflow to run as the Logic. No
default `inputs` are provided to the Logic. For
Workflows, `inputs` are passed to the workflow's
`configStep` as `inputs.parent`, which allows
workflows to be invoked as sub-workflows or by their
`crdRef`.

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
            <i>Enum</i>: ResourceFunction, ValueFunction, Workflow<br/>
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

### spec.steps[index].refSwitch

Dyanmically select the Function or Workflow to run as
the step's Logic. No default `inputs` are provided to
the Logic. For Workflows, `inputs` are passed to the
workflow's `configStep` as `inputs.parent`, which
allows workflows to be invoked as sub-workflows or by
their `crdRef`.

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
        <td><b><a href="#specstepsindexrefswitchcasesindex">cases</a></b></td>
        <td>[]object</td>
        <td>
          <br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>switchOn</b></td>
        <td>string</td>
        <td>
          <br/>
          <br/>
            <i>Validations</i>:<li>self.startsWith('='): must be an expression</li>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.steps[index].refSwitch.cases[index]

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
        <td><b>case</b></td>
        <td>string</td>
        <td>
          <br/>
          <br/>
            <i>Validations</i>:<li>!self.startsWith('='): may not be an expression</li>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>kind</b></td>
        <td>enum</td>
        <td>
          <br/>
          <br/>
            <i>Enum</i>: ResourceFunction, ValueFunction, Workflow<br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>name</b></td>
        <td>string</td>
        <td>
          <br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>default</b></td>
        <td>boolean</td>
        <td>
          <br/>
          <br/>
            <i>Default</i>: false<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.configStep

The entry-point for this Workflow. The triggering-object
will be passed as `inputs.parent`. Though not required, it
is _almost_ always required in order to process a
configuration that provides context to the remaining steps
such as a unique name.

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
        <td><b><a href="#specconfigstepref">ref</a></b></td>
        <td>object</td>
        <td>
          The Function or Workflow to run as the Logic. This
Logic will be passed the triggering-object as
`inputs.parent`.
<br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b><a href="#specconfigstepcondition">condition</a></b></td>
        <td>object</td>
        <td>
          Optional configuration for a Condition that will be set
in the triggering-object's `status.conditions` list.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>inputs</b></td>
        <td>object</td>
        <td>
          The inputs to be provided to the Logic. `inputs` must
be a map, but static values, arrays, and objects are
allowed. Koreo Expressions are allowed and are
indicated with a leading `=`. Note that no default
inputs are provided aside from `parent`.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>label</b></td>
        <td>string</td>
        <td>
          The name other steps may use to access this step's
return value or to express dependence on this step.
This is an identifier it must be alphanumeric
(including underscores). Defaults to `config`.
<br/>
          <br/>
            <i>Validations</i>:<li>self.matches("^[[:word:]]+$"): labels must be alphanumeric + underscores</li>
            <i>Default</i>: config<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>state</b></td>
        <td>object</td>
        <td>
          Defines an object that will be set on the parent's
`status.state`. Useful for surfacing values for
informational or debugging purposes, or to act as a
cache. The `state` objects from all steps are merged,
so if steps shares keys, the values from last step to
run may overwrite earlier values.
<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.configStep.ref

The Function or Workflow to run as the Logic. This
Logic will be passed the triggering-object as
`inputs.parent`.

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
            <i>Enum</i>: ResourceFunction, ValueFunction, Workflow<br/>
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

### spec.configStep.condition

Optional configuration for a Condition that will be set
in the triggering-object's `status.conditions` list.

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
        <td><b>name</b></td>
        <td>string</td>
        <td>
          A short, human-meaningful description of what the
step does or manages. It is used within simple
template descriptions to describe the step's
outcome.
<br/>
          <br/>
            <i>Validations</i>:<li>!self.startsWith('='): may not be an expression</li>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>type</b></td>
        <td>string</td>
        <td>
          The type for a condition acts as its key. If steps
share type, the condition from last run will be
reported on the parent.
<br/>
          <br/>
            <i>Validations</i>:<li>self.matches("^[A-Z][a-zA-Z0-9]+$"): must be PascalCase and contain only alphanumeric chars</li>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.crdRef

Optionally specify a Resource that will cause this Workflow
to run. The triggering-object will be passed to the
`configStep` as `inputs.parent`.

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
        <td><b>apiGroup</b></td>
        <td>string</td>
        <td>
          <br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>kind</b></td>
        <td>string</td>
        <td>
          <br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>version</b></td>
        <td>string</td>
        <td>
          <br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>
