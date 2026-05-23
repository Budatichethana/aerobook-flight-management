import LoginForm from '../../components/LoginForm'

type SearchParams = {
  next?: string | string[]
}

function readNextPath(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '/'
  }

  return value ?? '/'
}

export default function LoginPage({ searchParams }: { searchParams?: SearchParams }) {
  const nextPath = readNextPath(searchParams?.next)

  return <LoginForm nextPath={nextPath} />
}