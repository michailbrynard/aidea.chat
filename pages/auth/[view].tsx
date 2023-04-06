import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa, ViewType } from '@supabase/auth-ui-shared'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'

interface AuthProps {
    view: ViewType | undefined
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

const AuthPage: React.FC<AuthProps> = ({ view }) => {
    const supabaseClient = useSupabaseClient()
    const router = useRouter()
    const user = useUser()

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

    return {
        props: {
            view: view,
        }
    }
};
