import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa, ViewType } from '@supabase/auth-ui-shared'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { createServerSupabaseClient, Session, User } from '@supabase/auth-helpers-nextjs'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'

interface AuthProps {
    view: ViewType | undefined
    user: User | null
    session: Session | null
}

function isViewType(view: unknown): view is ViewType {
    return (
        view === "sign_in" ||
        view === "sign_up" ||
        view === "magic_link" ||
        view === "forgotten_password" ||
        view === "update_password"
    );
}

const AuthPage: React.FC<AuthProps> = ({ view, user }) => {
    const supabaseClient = useSupabaseClient()
    const router = useRouter()

    if (!user)
        return (
            <div className="w-full h-screen flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                    <Auth
                        appearance={{ theme: ThemeSupa }}
                        supabaseClient={supabaseClient}
                        providers={[]}
                        view={view}
                        socialLayout="horizontal"
                        redirectTo='/'
                    />
                </div>
            </div>
        )
    else {
        router.push('/')
        return <div>Logging in...</div>
    }
}

export default AuthPage

export const getServerSideProps: GetServerSideProps = async (ctx) => {

    if (!ctx.params || !ctx.params['view'] || typeof ctx.params['view'] !== 'string') {
        return {
            notFound: true,
        };
    }

    const view = ctx.params['view']?.replace('-', '_');

    if (!isViewType(view)) {
        return {
            notFound: true,
        };
    }

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
                props: { initialSession: session, user: session.user, view: view },
            },
        }

    return {
        props: {
            view: view,
            session: null,
            user: null,
        }
    }
};
