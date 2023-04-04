import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { createServerSupabaseClient, Session, User } from '@supabase/auth-helpers-nextjs'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'

const LoginPage = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  if (!user)
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <Auth
            redirectTo="http://localhost:3000"
            appearance={{ theme: ThemeSupa }}
            supabaseClient={supabaseClient}
            providers={[]}
            socialLayout="horizontal"
          />
        </div>
      </div>
    )
  else {
    router.push('/')
  }
}

export default LoginPage

export const getServerSideProps: GetServerSideProps = async (ctx) => {

  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx)
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session)
    return {
      redirect: {
        destination: '/',
        permanent: false,
        props: { initialSession: session, user: session.user },
      },
    }

  return {
    props: {
      initialSession: null,
      user: null,
    }
  }
};
