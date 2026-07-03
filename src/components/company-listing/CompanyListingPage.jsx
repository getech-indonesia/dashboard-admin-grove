import { useSearchParams } from 'react-router-dom'
import { Building2, List, Landmark } from 'lucide-react'
import CompanyList from '../company/CompanyList'
import ListingList from '../listing/ListingList'

export default function CompanyListingPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    
    // Read the active tab from search query, default to 'companies'
    const activeTab = searchParams.get('tab') || 'companies'

    const tabs = [
        {
            id: 'companies',
            label: 'Companies',
            icon: Building2,
            component: <CompanyList />
        },
        {
            id: 'listings',
            label: 'Listings',
            icon: List,
            component: <ListingList />
        }
    ]

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId })
    }

    const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0]

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-300">
            {/* HEADER SECTION */}
            <div className="border-b border-zinc-900 pb-5">
                <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2.5">
                    <Landmark className="w-6 h-6 text-emerald-400" />
                    Company & Listing
                </h1>
                <p className="text-zinc-500 text-xs mt-1.5 font-normal tracking-normal">
                    Consolidated corporate directory. Manage corporate emiten profiles and public ticker listings.
                </p>
            </div>

            {/* TAB SELECTOR HEADER */}
            <div className="flex border-b border-zinc-900 gap-1 p-1 bg-[#09090b] rounded-lg max-w-xs">
                {tabs.map((tab) => {
                    const IconComponent = tab.icon
                    const isActive = tab.id === currentTab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition-all duration-200 border ${
                                isActive
                                    ? 'bg-zinc-900 border-zinc-800 text-emerald-400 font-medium shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-zinc-950/40'
                            }`}
                        >
                            <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* TAB CONTENT MOUNT PANEL */}
            <div className="mt-4">
                {currentTab.component}
            </div>
        </div>
    )
}
