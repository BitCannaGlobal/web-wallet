<template>
  <CommonForm :submit="onSubmit">
    <h2 class="session-title">Choose a password</h2>
    <div>
      <CommonFormGroup
        :error="$v.fieldPassword.$error"
        field-id="sign-up-password"
        field-label="Password"
      >
        <CommonField
          id="sign-up-password"
          v-model="fieldPassword"
          v-focus
          type="password"
          placeholder="Must be at least 10 characters"
        />
        <CommonFormMessage
          v-if="$v.fieldPassword.$error && !$v.fieldPassword.required"
          name="Password"
          type="required"
        />
        <CommonFormMessage
          v-if="$v.fieldPassword.$error && !$v.fieldPassword.minLength"
          name="Password"
          type="minLength"
          min="10"
        />
      </CommonFormGroup>
      <CommonFormGroup
        :error="$v.fieldPasswordConfirm.$error"
        field-id="sign-up-password-confirm"
        field-label="Confirm Password"
      >
        <CommonField
          id="sign-up-password-confirm"
          v-model="fieldPasswordConfirm"
          type="password"
          placeholder="Enter password again"
        />
        <CommonFormMessage
          v-if="
            $v.fieldPasswordConfirm.$error &&
            !$v.fieldPasswordConfirm.sameAsPassword
          "
          name="Password confirmation"
          type="match"
        />
      </CommonFormGroup>
      <div class="session-footer">
        <CommonButton
          value="Next"
          type="submit"
          :disabled="loading"
          :loading="loading"
        />
      </div>
    </div>
  </CommonForm>
</template>

<script>
import { required, minLength, sameAs } from 'vuelidate/lib/validators'

export default {
  name: `PasswordStep`,
  props: {
    password: {
      type: String,
      default: undefined,
    },
  },
  data: () => ({
    fieldPassword: undefined,
    fieldPasswordConfirm: undefined,
    loading: false,
  }),
  mounted() {
    this.fieldPassword = this.password
  },
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      this.loading = true
      this.$emit('submit', this.fieldPassword)
    },
  },
  validations: () => ({
    fieldPassword: { required, minLength: minLength(10) },
    fieldPasswordConfirm: { sameAsPassword: sameAs(`fieldPassword`) },
  }),
}
</script>
