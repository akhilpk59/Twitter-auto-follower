import { useState } from "react";
import { Button, Card, CardContent } from "@/components/ui/card";

export default function Scraper() {
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchInfluencers = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:4000/scrape");
            const data = await response.json();
            if (data.success) {
                setInfluencers(data.influencers);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    return (
        <div className="p-4">
            <Button onClick={fetchInfluencers} disabled={loading}>
                {loading ? "Scraping..." : "Fetch AI Influencers"}
            </Button>
            <div className="grid grid-cols-2 gap-4 mt-4">
                {influencers.map((name, index) => (
                    <Card key={index}>
                        <CardContent className="p-4 text-lg font-semibold">
                            {name}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
