import { options } from "@/app/api/auth/[...nextauth]/options"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = async () => {
  return await getServerSession(options)
}

export const getServerAuthSessionForPages = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  return await getServerSession(req, res, options)
}
