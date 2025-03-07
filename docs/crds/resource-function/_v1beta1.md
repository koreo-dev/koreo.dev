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
      <td>ResourceFunction</td>
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
        <td><b><a href="#specapiconfig">apiConfig</a></b></td>
        <td>object</td>
        <td>
          <br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b><a href="#speccreate">create</a></b></td>
        <td>object</td>
        <td>
          Specify if the resource should be created if missing, and
optionally values to be set only at create time.
<br/>
          <br/>
            <i>Default</i>: map[delay:30 enabled:true]<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specdelete">delete</a></b></td>
        <td>object</td>
        <td>
          Specify the deletion behavior for the underlying managed
resource.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>locals</b></td>
        <td>object</td>
        <td>
          Constant values or Koreo Expressions which will make
`resource`, `apiConfig`, and `return` more ergonomic to
write.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specoverlaysindex">overlays</a></b></td>
        <td>[]object</td>
        <td>
          An optional series of overlays that will be applied to the
resource (from `resource` or `resourceTemplateRef`) to
build the Target Resource Specification. This allows for
optionally updating values and for building the Target
Resource Specification without building a single large,
complex overlay.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specpostconditionsindex">postconditions</a></b></td>
        <td>[]object</td>
        <td>
          Optional set of postconditions which will be evaluated
after CRUD operations to determine if the managed resource
is ready.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specpreconditionsindex">preconditions</a></b></td>
        <td>[]object</td>
        <td>
          Optional set of preconditions which will be evaluated to
determine if the Function can, or should, be run and if not
specifies the outcome.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>resource</b></td>
        <td>object</td>
        <td>
          Inline Target Resource Specification. The controller will
work to keep the managed resource matching this
specification.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specresourcetemplateref">resourceTemplateRef</a></b></td>
        <td>object</td>
        <td>
          Dynamically loaded Target Resource Specification.<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>return</b></td>
        <td>object</td>
        <td>
          The return value expression for this ResourceFunction. It
must be an object composed of constant values or Koreo
Expressions with access to `inputs`, `locals`, and
`resource`.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specupdate">update</a></b></td>
        <td>object</td>
        <td>
          Specify how differences should be resolved.<br/>
          <br/>
            <i>Default</i>: map[patch:map[delay:30]]<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.apiConfig

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
        <td><b>name</b></td>
        <td>string</td>
        <td>
          <br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>namespace</b></td>
        <td>string</td>
        <td>
          <br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>namespaced</b></td>
        <td>boolean</td>
        <td>
          <br/>
          <br/>
            <i>Default</i>: true<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>owned</b></td>
        <td>boolean</td>
        <td>
          <br/>
          <br/>
            <i>Default</i>: true<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>plural</b></td>
        <td>string</td>
        <td>
          <br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>readonly</b></td>
        <td>boolean</td>
        <td>
          <br/>
          <br/>
            <i>Default</i>: false<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.create

Specify if the resource should be created if missing, and
optionally values to be set only at create time.

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
          Number of seconds to wait after creating before
checking status.
<br/>
          <br/>
            <i>Default</i>: 30<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>enabled</b></td>
        <td>boolean</td>
        <td>
          <br/>
          <br/>
            <i>Default</i>: true<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>overlay</b></td>
        <td>object</td>
        <td>
          Values to be set only at create time, but otherwise
ignored from difference validation.
<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.delete

Specify the deletion behavior for the underlying managed
resource.

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
        <td><b>abandon</b></td>
        <td>object</td>
        <td>
          If this function is no longer run, leave the resource
in cluster and remove the owner ref.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>destroy</b></td>
        <td>object</td>
        <td>
          If this function is no longer run, delete the resource
from the cluster.
<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.overlays[index]

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
        <td><b>inputs</b></td>
        <td>object</td>
        <td>
          The inputs to be provided to the ValueFunction.
`inputs` must be a map, but static values, arrays,
and objects are allowed. You may provide the resource
using `resource`, which will contain the current
Target Resource Specification. Koreo Expressions are
allowed and are indicated with a leading `=`. Note
that no default inputs are provided.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>overlay</b></td>
        <td>object</td>
        <td>
          Inline overlay specification.<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specoverlaysindexoverlayref">overlayRef</a></b></td>
        <td>object</td>
        <td>
          Dynamically loaded Target Resource Specification.
ValueFunctions are supported. The ValueFunction's
return value is treated as the overlay.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>skipIf</b></td>
        <td>string</td>
        <td>
          Skip if the condition evaluates true.<br/>
          <br/>
            <i>Validations</i>:<li>self.startsWith('='): must be an expression (start with '=').</li>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.overlays[index].overlayRef

Dynamically loaded Target Resource Specification.
ValueFunctions are supported. The ValueFunction's
return value is treated as the overlay.

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
            <i>Enum</i>: ValueFunction<br/>
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

### spec.postconditions[index]

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
        <td><b>assert</b></td>
        <td>string</td>
        <td>
          A predicate which must evaluate to `true`, if it does
not the specified outcome is returned. This should be
a Koreo Expression and it may access the function's
`inputs`, `locals`, and `resource`.
<br/>
          <br/>
            <i>Validations</i>:<li>self.startsWith('='): assertion must be an expression (start with '=').</li>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b><a href="#specpostconditionsindexdepskip">depSkip</a></b></td>
        <td>object</td>
        <td>
          Indicates that the Function outcome should be
considered a DepSkip. Especially useful for readonly.
Use message to indicate why. Note this is not an
error.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>ok</b></td>
        <td>object</td>
        <td>
          <br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specpostconditionsindexpermfail">permFail</a></b></td>
        <td>object</td>
        <td>
          Indicates that an unrecoverable error has occurred,
intervention is required to correct this condition.
This will cause Workflows to stop retrying. Use
message to provide information to correct the issue.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specpostconditionsindexretry">retry</a></b></td>
        <td>object</td>
        <td>
          Indicates that a condition is not yet met, so the
Workflow should wait and retry after delay seconds.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specpostconditionsindexskip">skip</a></b></td>
        <td>object</td>
        <td>
          Indicates that the Function outcome should be
considered a Skip. Especially useful for readonly.
Use message to indicate why. Note this is not an
error.
<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.postconditions[index].depSkip

Indicates that the Function outcome should be
considered a DepSkip. Especially useful for readonly.
Use message to indicate why. Note this is not an
error.

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
          <br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.postconditions[index].permFail

Indicates that an unrecoverable error has occurred,
intervention is required to correct this condition.
This will cause Workflows to stop retrying. Use
message to provide information to correct the issue.

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
          <br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.postconditions[index].retry

Indicates that a condition is not yet met, so the
Workflow should wait and retry after delay seconds.

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
          <br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>message</b></td>
        <td>string</td>
        <td>
          <br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.postconditions[index].skip

Indicates that the Function outcome should be
considered a Skip. Especially useful for readonly.
Use message to indicate why. Note this is not an
error.

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
          <br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.preconditions[index]

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
        <td><b>assert</b></td>
        <td>string</td>
        <td>
          A predicate which must evaluate to `true`, if it does
not the specified outcome is returned. This should be
a Koreo Expression and it may access the function's
`inputs`.
<br/>
          <br/>
            <i>Validations</i>:<li>self.startsWith('='): assertion must be an expression (start with '=').</li>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b><a href="#specpreconditionsindexdepskip">depSkip</a></b></td>
        <td>object</td>
        <td>
          Indicates that the Function did not run due to a
dependency not being ready or being skipped. Use
message to indicate why. Note this is not an error.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b>ok</b></td>
        <td>object</td>
        <td>
          <br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specpreconditionsindexpermfail">permFail</a></b></td>
        <td>object</td>
        <td>
          Indicates that an unrecoverable error has occurred,
intervention is required to correct this condition.
This will cause Workflows to stop retrying. Use
message to provide information to correct the issue.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specpreconditionsindexretry">retry</a></b></td>
        <td>object</td>
        <td>
          Indicates that a condition is not yet met, so the
function can not (or should not) evaluate yet. Wait
and retry after delay seconds.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specpreconditionsindexskip">skip</a></b></td>
        <td>object</td>
        <td>
          Indicates that the Function did not run due to a
condition, such as a config value. Use message to
indicate why. Note this is not an error.
<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.preconditions[index].depSkip

Indicates that the Function did not run due to a
dependency not being ready or being skipped. Use
message to indicate why. Note this is not an error.

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
          <br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.preconditions[index].permFail

Indicates that an unrecoverable error has occurred,
intervention is required to correct this condition.
This will cause Workflows to stop retrying. Use
message to provide information to correct the issue.

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
          <br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.preconditions[index].retry

Indicates that a condition is not yet met, so the
function can not (or should not) evaluate yet. Wait
and retry after delay seconds.

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
          <br/>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>message</b></td>
        <td>string</td>
        <td>
          <br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.preconditions[index].skip

Indicates that the Function did not run due to a
condition, such as a config value. Use message to
indicate why. Note this is not an error.

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
          <br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.resourceTemplateRef

Dynamically loaded Target Resource Specification.

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
          <br/>
        </td>
        <td>true</td>
      </tr></tbody>
</table>

### spec.update

Specify how differences should be resolved.

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
        <td><b>never</b></td>
        <td>object</td>
        <td>
          Ignore any differences.<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specupdatepatch">patch</a></b></td>
        <td>object</td>
        <td>
          If differences are found, patch the resource to correct
the difference.
<br/>
        </td>
        <td>false</td>
      </tr><tr>
        <td><b><a href="#specupdaterecreate">recreate</a></b></td>
        <td>object</td>
        <td>
          If differences are found, delete the resource so that
it will be recreated.
<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

If differences are found, patch the resource to correct
the difference.

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
          <br/>
          <br/>
            <i>Default</i>: 30<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>

### spec.update.recreate

If differences are found, delete the resource so that
it will be recreated.

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
          <br/>
          <br/>
            <i>Default</i>: 30<br/>
        </td>
        <td>false</td>
      </tr></tbody>
</table>
