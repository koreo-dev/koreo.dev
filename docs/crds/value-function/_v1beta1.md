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
      <td>ValueFunction</td>
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
        <td><b>locals</b></td>
        <td>object</td>
        <td>
          Constant values or Koreo Expressions which will make
`return` more ergonomic to write.
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
        <td><b>return</b></td>
        <td>object</td>
        <td>
          The return value expression for this ValueFunction. It must
be an object composed of constant values or Koreo
Expressions with access to both `inputs` and `locals`.
<br/>
        </td>
        <td>false</td>
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
            <i>Validations</i>:<li>self.startsWith('='): assertion must be an expression (start with '=')</li>
        </td>
        <td>true</td>
      </tr><tr>
        <td><b>defaultReturn</b></td>
        <td>object</td>
        <td>
          A static, default return value.<br/>
        </td>
        <td>false</td>
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
