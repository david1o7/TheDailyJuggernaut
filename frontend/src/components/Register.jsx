import React from 'react'
import Form from './Form'
const Register = () => {
  return (
    <div>
       <Form route="/api/auth/register/" method="register" />
    </div>
  )
}

export default Register
