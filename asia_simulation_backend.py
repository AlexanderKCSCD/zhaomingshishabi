from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MAX_INITIAL_FUNDS = 100000
MAX_LOAN_PER_ROUND = 20000
MAX_TOTAL_LOAN = 60000
TOTAL_ROUNDS = 8

companies = {}

def calculate_score(production, quality, marketing, remaining_funds):
    ideal_production = 20000
    ideal_quality = 15000
    ideal_marketing = 15000

    score = 0
    score += min(production / ideal_production, 1.0) * 30
    score += min(quality / ideal_quality, 1.0) * 30
    score += min(marketing / ideal_marketing, 1.0) * 30
    score += 10 if remaining_funds >= 0 else 0
    return round(score, 2)

@app.route("/create_company", methods=["POST"])
def create_company():
    data = request.get_json()
    name = data.get("name")
    if not name:
        return jsonify({"error": "公司名称不能为空"}), 400
    if name in companies:
        return jsonify({"error": "公司已存在"}), 400

    companies[name] = {
        "funds": MAX_INITIAL_FUNDS,
        "loans": 0,
        "total_score": 0,
        "history": []
    }
    return jsonify({"message": "公司创建成功", "funds": MAX_INITIAL_FUNDS})

@app.route("/submit_strategy", methods=["POST"])
def submit_strategy():
    data = request.get_json()
    name = data.get("name")
    round_num = data.get("round")
    loan = data.get("loan", 0)
    production = data.get("production", 0)
    quality = data.get("quality", 0)
    marketing = data.get("marketing", 0)

    if name not in companies:
        return jsonify({"error": "公司不存在"}), 400
    if round_num < 1 or round_num > TOTAL_ROUNDS:
        return jsonify({"error": "轮次非法"}), 400
    if loan > MAX_LOAN_PER_ROUND:
        return jsonify({"error": f"本轮贷款不能超过 {MAX_LOAN_PER_ROUND}"}), 400

    company = companies[name]
    if company["loans"] + loan > MAX_TOTAL_LOAN:
        return jsonify({"error": f"累计贷款不能超过 {MAX_TOTAL_LOAN}"}), 400

    spend = production + quality + marketing
    company["loans"] += loan
    company["funds"] += loan - spend

    score = calculate_score(production, quality, marketing, company["funds"])
    company["total_score"] += score

    company["history"].append({
        "round": round_num,
        "loan": loan,
        "production": production,
        "quality": quality,
        "marketing": marketing,
        "spend": spend,
        "remaining_funds": company["funds"],
        "total_loans": company["loans"],
        "round_score": score,
        "total_score": company["total_score"]
    })

    return jsonify({
        "message": "策略提交成功",
        "round_score": score,
        "total_score": company["total_score"],
        "remaining_funds": company["funds"]
    })

@app.route("/get_company", methods=["GET"])
def get_company():
    name = request.args.get("name")
    if name not in companies:
        return jsonify({"error": "公司不存在"}), 400
    return jsonify(companies[name])

@app.route("/rankings", methods=["GET"])
def get_rankings():
    ranking = sorted(
        ((name, data["total_score"]) for name, data in companies.items()),
        key=lambda x: x[1],
        reverse=True
    )
    return jsonify([{"name": r[0], "total_score": r[1]} for r in ranking])

if __name__ == "__main__":
    app.run(debug=True)
