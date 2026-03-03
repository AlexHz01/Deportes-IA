import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const matchCount = await prisma.match.count()
    console.log('Total matches:', matchCount)

    const matchesByLeague = await prisma.league.findMany({
        include: {
            _count: {
                select: { matches: true }
            }
        }
    })

    console.log('Matches by league:')
    matchesByLeague.forEach(l => {
        console.log(`${l.name} (${l.externalId}): ${l._count.matches} matches`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
